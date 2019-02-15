import { AuthToken } from "../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { MultichainClient } from "../service/Client.h";
import { getCurrentVote, voteForNetworkPermission } from "./controller/vote";
import * as AccessVote from "./model/AccessVote";
import * as Nodes from "./model/Nodes";
import { WalletAddress } from "./model/Nodes";

export async function voteHelper(
  multichain: MultichainClient,
  user: AuthToken,
  targetAddress: WalletAddress,
  vote: AccessVote.t,
): Promise<HttpResponse> {
  const callerAddress = user.organizationAddress;
  const currentVote = await getCurrentVote(multichain, callerAddress, targetAddress);
  const currentAccess = await getCurrentAccess(multichain, targetAddress);
  logger.debug({ callerAddress, targetAddress, currentVote, currentAccess }, "Preparing vote");

  if (currentVote !== "none") {
    const message =
      `Conflict: your organization ${user.organization} (${callerAddress}) has ` +
      `already voted for assigning ${currentVote} permissions to ${targetAddress}.`;
    return [409, { apiVersion: "1.0", error: { code: 409, message } }];
  }
  if (currentAccess !== "none") {
    const message =
      `Conflict: the organization (${targetAddress}) has already ` +
      `${currentAccess} permissions assigned.`;
    return [409, { apiVersion: "1.0", error: { code: 409, message } }];
  }

  const fakeReq = {
    user,
    body: {
      apiVersion: "1.0",
      data: {
        address: targetAddress,
        vote,
      },
    },
  } as AuthenticatedRequest;

  return voteForNetworkPermission(multichain, fakeReq);
}

async function getCurrentAccess(
  multichain: MultichainClient,
  address: WalletAddress,
): Promise<AccessVote.t> {
  const permissions = await Nodes.getNetworkPermissions(multichain, address);

  const hasAdminPermissions = permissions
    .filter(x => x.permission === "admin")
    .map(x => x.isEffective)
    .find(_ => true);

  if (hasAdminPermissions) {
    logger.debug("Node has admin permissions");
    return "admin";
  }

  const hasBasicPermissions = permissions
    .filter(x => x.permission === "connect")
    .map(x => x.isEffective)
    .find(_ => true);

  if (hasBasicPermissions) {
    logger.debug("Node has basic permissions");
    return "basic";
  }

  logger.debug("Node has no permissions");
  return "none";
}
