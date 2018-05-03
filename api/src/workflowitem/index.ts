import { getAllowedIntents } from "../authz";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import { MultichainClient, Resource } from "../multichain/Client.h";

const workflowitemsGroupKey = subprojectId => `${subprojectId}_workflows`;

const workflowitemKey = (subprojectId, workflowitemId) => [
  workflowitemsGroupKey(subprojectId),
  workflowitemId,
];

interface WorkflowitemResource extends Resource {
  data: Data;
}

export interface Data {
  id: string;
  creationUnixTs: string;
  displayName: string;
  amount: string;
  currency: string;
  amountType: "N/A" | "disbursed" | "allocated";
  description: string;
  status: "open" | "closed";
  assignee?: string;
  documents: Document[];
  previousWorkflowitemId?: string;
}

export interface Document {
  description: string;
  hash: string;
}

export interface DataWithIntents extends Data {
  allowedIntents: Intent[];
}

export interface ObscuredDataWithIntents {
  id: string;
  creationUnixTs: string;
  displayName: null;
  amount: null;
  currency: null;
  amountType: null;
  description: null;
  status: "open" | "closed";
  assignee: null;
  documents: null;
  previousWorkflowitemId?: string;
  allowedIntents: Intent[];
}

export const create = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  data: Data,
  permissions: AllowedUserGroupsByIntent,
): Promise<void> => {
  const resource: WorkflowitemResource = {
    log: [
      { creationUnixTs: data.creationUnixTs, issuer: token.userId, action: "workflowitem_created" },
    ],
    permissions,
    data,
  };
  return multichain.setValue(projectId, workflowitemKey(subprojectId, data.id), resource);
};

const getAll = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<WorkflowitemResource[]> => {
  const streamItems = await multichain.getLatestValues(
    projectId,
    workflowitemsGroupKey(subprojectId),
  );
  return streamItems.map(x => x.resource);
};

export const getAllForUser = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
): Promise<Array<DataWithIntents | ObscuredDataWithIntents>> => {
  const resources = await getAll(multichain, projectId, subprojectId);
  const allWorkflowitems = await Promise.all(
    resources.map(async resource => {
      return {
        ...resource.data,
        allowedIntents: await getAllowedIntents(token, resource.permissions),
      };
    }),
  );
  // Instead of filtering out workflowitems the user is not allowed to see,
  // we simply blank out all fields except the status, which is considered "public":
  const allowedToSeeIntent: Intent = "workflowitem.view";
  const clearedWorkflowitems = allWorkflowitems.map(workflowitem => {
    const isAllowedToSee = workflowitem.allowedIntents.includes(allowedToSeeIntent);
    if (isAllowedToSee) {
      return workflowitem;
    } else {
      return {
        id: workflowitem.id,
        creationUnixTs: workflowitem.creationUnixTs,
        displayName: null,
        amount: null,
        currency: null,
        amountType: null,
        description: null,
        status: workflowitem.status,
        assignee: null,
        documents: null,
        previousWorkflowitemId: workflowitem.previousWorkflowitemId,
        allowedIntents: workflowitem.allowedIntents,
      };
    }
  });
  return clearedWorkflowitems;
};

export const close = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
): Promise<void> => {
  await multichain.updateValue(projectId, workflowitemId, (workflowitem: WorkflowitemResource) => {
    workflowitem.data.status = "closed";
    return workflowitem;
  });
};

export const assign = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
  userId: string,
): Promise<void> => {
  await multichain.updateValue(projectId, workflowitemId, (workflowitem: WorkflowitemResource) => {
    workflowitem.data.assignee = userId;
    return workflowitem;
  });
};

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
): Promise<AllowedUserGroupsByIntent> => {
  const streamItem = await multichain.getValue(projectId, workflowitemId);
  return streamItem.resource.permissions;
};

export const grantPermission = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
  userId: string,
  intent: Intent,
): Promise<void> => {
  await multichain.updateValue(projectId, workflowitemId, (workflowitem: WorkflowitemResource) => {
    const permissionsForIntent: People = workflowitem.permissions[intent] || [];
    if (!permissionsForIntent.includes(userId)) {
      permissionsForIntent.push(userId);
      workflowitem.permissions[intent] = permissionsForIntent;
    }
    return workflowitem;
  });
};

export const revokePermission = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
  userId: string,
  intent: Intent,
): Promise<void> => {
  await multichain.updateValue(projectId, workflowitemId, (workflowitem: Resource) => {
    const permissionsForIntent: People = workflowitem.permissions[intent] || [];
    const userIndex = permissionsForIntent.indexOf(userId);
    if (userIndex === -1) {
      // Remove the user from the array:
      permissionsForIntent.splice(userIndex, 1);
      workflowitem.permissions[intent] = permissionsForIntent;
    }
    return workflowitem;
  });
};
