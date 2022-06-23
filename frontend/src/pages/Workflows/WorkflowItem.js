import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import green from "@mui/material/colors/lightGreen";
import red from "@mui/material/colors/red";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { withStyles, withTheme } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AttachmentIcon from "@mui/icons-material/Attachment";
import DoneIcon from "@mui/icons-material/Check";
import RejectedIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import OpenIcon from "@mui/icons-material/Remove";
import SwapIcon from "@mui/icons-material/SwapCalls";
import HiddenIcon from "@mui/icons-material/VisibilityOff";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import { SortableElement } from "react-sortable-hoc";
import { amountTypes, fromAmountString, isDateReached, toAmountString } from "../../helper.js";
import strings from "../../localizeStrings";
import { canAssignWorkflowItem, canUpdateWorkflowItem, canViewWorkflowItemPermissions } from "../../permissions.js";
import ActionButton from "../Common/ActionButton";
import StyledBadge from "../Common/StyledBadge";
import WorkflowAssigneeContainer from "./WorkflowAssigneeContainer.js";

const styles = theme => {
  return {
    text: {
      fontSize: "14px"
    },
    tooltip: {
      margin: "0px",
      padding: "0px 5px 0px 15px"
    },
    tooltipItem: {
      fontSize: "12px",
      margin: "5px 0"
    },
    dots: {
      height: 20,
      width: 20,
      textAlign: "center",
      display: "inline-block",
      position: "absolute",
      zIndex: "20",
      top: "21px",
      left: "16px",
      borderRadius: "10px"
    },
    checkbox: {
      height: 20,
      width: 20,
      textAlign: "center",
      display: "inline-block",
      position: "absolute",
      top: "8px",
      left: "5px",
      borderRadius: "10px"
    },
    actions: {
      display: "flex",
      justifyContent: "center",
      width: "100%"
    },
    actionButton: {
      width: "25%"
    },
    line: {
      position: "absolute",
      borderLeft: "2px",
      borderLeftStyle: "solid",
      borderLeftColor: "black",
      height: "100%",
      left: "25px",
      bottom: "43px"
    },
    firstLine: {
      position: "absolute",
      borderLeft: "2px solid",
      borderLeftColor: "black",
      height: "38px",
      left: "25px",
      bottom: "43px"
    },
    buttonStyle: {
      minWidth: "30px",
      marginLeft: "5px"
    },
    amountChip: {
      marginLeft: "16px"
    },
    statusChip: {
      marginLeft: "4px"
    },
    chipLabel: {
      fontSize: 10
    },
    chipDiv: {
      display: "flex",
      alignItems: "center"
    },
    redacted: {
      fontStyle: "italic"
    },
    chip: {
      margin: 4
    },
    workflowContent: {
      display: "flex",
      justifyContent: "space-between",
      overflow: "hidden",
      padding: "4px 8px 4px 4px"
    },
    infoCell: {
      width: "8%",
      display: "flex",
      alignItems: "center"
    },
    workflowCell: {
      width: "25%",
      display: "flex",
      alignItems: "center"
    },
    actionCell: {
      width: "20%",
      display: "flex",
      alignItems: "center"
    },
    typographs: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "100%"
    },
    card: {
      marginLeft: "50px",
      marginRight: "10px",
      marginTop: "15px",
      marginBottom: "15px"
    },
    container: {
      position: "relative"
    },
    icon: {
      width: "14px",
      height: "20px"
    },
    hide: {
      opacity: 0
    },
    amountFieldContainer: {
      display: "flex"
    },
    amountField: {
      paddingTop: "4px",
      paddingLeft: "4px"
    },
    setGrabCursor: {
      cursor: "-webkit-grab"
    },
    itemByDefault: {
      marginLeft: "15vh",
      marginRight: "10px",
      marginTop: "15px",
      marginBottom: "15px"
    }
  };
};

const createLine = (classes, isFirst, selectable) => {
  let lineClass = "";
  let lineStyle = {};
  if (isFirst && selectable) {
    lineClass = classes.firstLine;
    lineStyle = {};
  } else {
    lineClass = classes.line;
    lineStyle = { opacity: selectable ? 1 : 0.2 };
  }
  return <div className={lineClass} style={lineStyle} />;
};

const StepDot = props => {
  const {
    classes,
    sortEnabled,
    status,
    selectable,
    redacted,
    storeWorkflowItemsSelected,
    selectedWorkflowItems,
    currentWorkflowItem,
    allowedIntents
  } = props;
  let Icon;
  switch (status) {
    case "open":
      Icon = OpenIcon;
      break;
    case "closed":
      Icon = DoneIcon;
      break;
    default:
      Icon = OpenIcon;
  }
  const updateSelectedList = event => {
    if (event.target.checked) {
      selectedWorkflowItems.push(currentWorkflowItem);
    } else {
      selectedWorkflowItems.splice(selectedWorkflowItems.indexOf(currentWorkflowItem), 1);
    }
    storeWorkflowItemsSelected(selectedWorkflowItems);
  };
  return isWorkflowItemSelectable(redacted, sortEnabled, allowedIntents) ? (
    <div className={classes.checkbox}>
      <Checkbox onChange={updateSelectedList} data-test="check-workflowitem" />
    </div>
  ) : (
    <Paper className={classes.dots} elevation={2} disabled={selectable}>
      <Icon className={classes.icon} style={{ opacity: selectable ? 1 : 0.3 }} />
    </Paper>
  );
};

function isWorkflowItemSelectable(redacted, sortenabled, allowedIntents) {
  if (redacted || !sortenabled) {
    return false;
  }
  const intents = allowedIntents.filter(
    i =>
      i === "workflowitem.intent.listPermissions" ||
      i === "workflowitem.intent.grantPermission" ||
      i === "workflowitem.intent.revokePermission"
  );
  // a user must have assign permissions or all three permission handling permissions
  return allowedIntents.includes("workflowitem.assign") || intents.length === 3 ? true : false;
}

const editWorkflow = (
  {
    id,
    displayName,
    amount,
    exchangeRate,
    amountType,
    currency,
    description,
    status,
    documents,
    dueDate,
    workflowitemType
  },
  props
) => {
  // Otherwise we need to deal with undefined which causes errors in the editDialog
  const workflowitemAmount = amount ? amount : "";
  const workflowitemCurrency = currency ? currency : props.currency;
  exchangeRate = parseFloat(exchangeRate);
  props.showEditDialog(
    id,
    displayName,
    toAmountString(workflowitemAmount),
    exchangeRate,
    amountType,
    description,
    workflowitemCurrency,
    documents,
    dueDate,
    workflowitemType
  );
};

const getInfoButton = (classes, props, status, workflowSortEnabled, workflow) => {
  const { openWorkflowDetails, projectId, subProjectId } = props;

  const showBadge = status === "open" && isDateReached(workflow.dueDate) && !workflowSortEnabled;
  return (
    <div>
      <StyledBadge
        variant="dot"
        invisible={!showBadge}
        data-test={
          showBadge ? `info-warning-badge-enabled-${workflow.id}` : `info-warning-badge-disabled-${workflow.id}`
        }
        className={classes.buttonStyle}
      >
        <IconButton
          disabled={workflowSortEnabled}
          className={`${getButtonClass(classes, workflowSortEnabled, status)}`}
          onClick={() => openWorkflowDetails(projectId, subProjectId, workflow.id)}
          data-test={`workflowitem-info-button-${workflow.id}`}
          size="large"
        >
          <InfoIcon />
        </IconButton>
      </StyledBadge>
    </div>
  );
};

const getAttachmentButton = (
  classes,
  { openWorkflowDetails, projectId, subProjectId },
  status,
  workflowSortEnabled,
  workflow
) => {
  const { documents } = workflow;
  const showAttachFileBadge = documents && documents.length > 0;
  const showToolTip = documents && documents.length > 0 && documents.some(doc => doc.fileName !== undefined);

  return (
    <div>
      {showAttachFileBadge && showToolTip && (
        <StyledBadge
          variant="dot"
          invisible={!showAttachFileBadge}
          data-test={`attachment-file-badge-show-${workflow.id}`}
          className={classes.buttonStyle}
        >
          <IconButton
            style={{ cursor: "default" }}
            data-test={`workflowitem-attachment-file-button-${workflow.id}`}
            size="large"
            onClick={() => {
              const documentTab = 1;
              openWorkflowDetails(projectId, subProjectId, workflow.id, documentTab);
            }}
          >
            <AttachmentIcon />
          </IconButton>
        </StyledBadge>
      )}
    </div>
  );
};

const isWorkflowSelectable = (currentWorkflowSelectable, workflowSortEnabled, status) => {
  const workflowSortable = status === "open";
  return workflowSortEnabled ? workflowSortable : currentWorkflowSelectable;
};

const getAmountField = (classes, amount, type, exchangeRate, sourceCurrency, targetCurrency) => {
  const amountToShow = toAmountString(amount * exchangeRate, targetCurrency);

  const amountExplanationTitle = toAmountString(amount, sourceCurrency) + " x " + exchangeRate;
  const amountExplaination = (
    <Tooltip data-test={"amount-explanation-" + sourceCurrency} title={amountExplanationTitle}>
      <SwapIcon />
    </Tooltip>
  );
  const isAmountDisplayed = amount !== undefined && exchangeRate !== undefined;
  return (
    <div className={classes.amountFieldContainer}>
      {isAmountDisplayed ? (
        <div className={classes.chipDiv}>
          <div>{amountToShow}</div>
          <div className={classes.amountField}>{fromAmountString(exchangeRate) !== 1 ? amountExplaination : null}</div>
        </div>
      ) : null}
      <div>
        <Chip className={classes.amountChip} label={amountTypes(type)} />
      </div>
    </div>
  );
};

const getButtonClass = (classes, workflowSortEnabled, status) => {
  if (workflowSortEnabled) {
    if (status === "closed") {
      return `${classes.hide}`;
    } else {
      return `${classes.hide} ${classes.setGrabCursor}`;
    }
  }
  return {};
};

const getCardStyle = (classes, workflowSortEnabled, status, rejected) => {
  let style = {};
  if (status === "closed" && !rejected) {
    style = { background: green[50] };
  }
  if (status === "closed" && rejected) {
    style = { background: red[50] };
  }
  return style;
};

const getCardClass = (classes, workflowSortEnabled, status) => {
  let cardClass = {};
  if (status !== "closed") {
    if (workflowSortEnabled) {
      cardClass = `${classes.setGrabCursor}`;
    }
  }
  return cardClass;
};

const renderActionButtons = (
  classes,
  canEditWorkflow,
  edit,
  canListWorkflowPermissions,
  showPerm,
  canCloseWorkflow,
  close,
  selectable,
  workflowSortEnabled,
  status,
  showAdditionalData,
  additionalData,
  idsPermissionsUnassigned,
  id,
  rejectReason,
  showReasonDialog,
  reject
) => {
  const additionalDataDisabled = _isEmpty(additionalData) || workflowSortEnabled;
  const editDisabled = !canEditWorkflow || workflowSortEnabled;
  const permissionsDisabled = !canListWorkflowPermissions || workflowSortEnabled;
  const closeDisabled = !canCloseWorkflow || workflowSortEnabled;
  const statusIsClosed = workflowSortEnabled || status === "closed" || closeDisabled;
  return (
    <div className={classes.actionCell}>
      <div className={classes.actions}>
        <ActionButton
          notVisible={additionalDataDisabled || status === "closed" || additionalDataDisabled}
          onClick={additionalDataDisabled ? undefined : showAdditionalData}
          icon={<MoreIcon />}
          title={additionalDataDisabled ? "" : strings.common.additional_data}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          data-test="additional-workflowitem-data-icon"
          iconButtonClassName={getButtonClass(workflowSortEnabled, status)}
        />
        <ActionButton
          notVisible={workflowSortEnabled || status === "closed" || editDisabled}
          onClick={editDisabled ? undefined : edit}
          icon={<EditIcon />}
          title={editDisabled ? "" : strings.common.edit}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          data-test="edit-workflowitem"
          iconButtonClassName={getButtonClass(workflowSortEnabled, status)}
        />
        {workflowSortEnabled || permissionsDisabled ? null : (
          <ActionButton
            notVisible={workflowSortEnabled || permissionsDisabled}
            onClick={permissionsDisabled ? undefined : showPerm}
            icon={<PermissionIcon />}
            title={permissionsDisabled ? "" : strings.common.show_permissions}
            workflowSortEnabled={workflowSortEnabled}
            status={status}
            data-test="show-workflowitem-permissions"
            iconButtonClassName={getButtonClass(workflowSortEnabled, status)}
          />
        )}

        {statusIsClosed ? null : (
          <>
            <ActionButton
              onClick={closeDisabled ? undefined : reject}
              icon={<RejectedIcon />}
              title={closeDisabled ? "" : strings.common.reject}
              workflowSortEnabled={workflowSortEnabled}
              status={status}
              iconButtonClassName={getButtonClass(workflowSortEnabled, status)}
              data-test="reject-workflowitem"
            />

            <ActionButton
              onClick={closeDisabled ? undefined : close}
              icon={<DoneIcon />}
              title={closeDisabled ? "" : strings.common.close}
              workflowSortEnabled={workflowSortEnabled}
              status={status}
              iconButtonClassName={getButtonClass(workflowSortEnabled, status)}
              data-test="close-workflowitem"
            />
          </>
        )}

        <ActionButton
          notVisible={status !== "closed" || !rejectReason}
          onClick={rejectReason ? showReasonDialog : undefined}
          icon={<ErrorOutlineIcon />}
          title={strings.common.rejected}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          iconButtonClassName={getButtonClass(workflowSortEnabled, status)}
          data-test="closed-workflowitem-reject-reason"
        />
      </div>
    </div>
  );
};

export const WorkflowItem = withTheme(
  withStyles(styles)(
    SortableElement(
      ({
        classes,
        workflow,
        mapIndex,
        index,
        currentWorkflowSelectable,
        workflowSortEnabled,
        parentProject,
        users,
        idsPermissionsUnassigned,
        currentUser,
        ...props
      }) => {
        const { storeWorkflowItemsSelected, selectedWorkflowItems, currency: targetCurrency } = props;
        const {
          id,
          status,
          displayName,
          amountType,
          amount,
          assignee,
          exchangeRate,
          currency: sourceCurrency,
          rejectReason,
          additionalData
        } = workflow.data;
        const allowedIntents = workflow.allowedIntents;
        const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
        const itemStyle = workflowSelectable ? {} : { opacity: 0.31 };
        const showEdit = canUpdateWorkflowItem(allowedIntents) && status !== "closed";
        const infoButton = getInfoButton(classes, props, status, workflowSortEnabled, workflow.data);
        const attachmentButton = getAttachmentButton(classes, props, status, workflowSortEnabled, workflow.data);
        const canAssign = canAssignWorkflowItem(allowedIntents) && status !== "closed";
        const canCloseWorkflowitem = currentUser === assignee;
        const showClose = canCloseWorkflowitem && workflowSelectable && status !== "closed";

        return (
          <div className={classes.container} data-test={`workflowitem-container-${id}`}>
            {createLine(classes, mapIndex === 0, workflowSelectable)}
            <StepDot
              classes={classes}
              sortEnabled={workflowSortEnabled}
              status={status}
              selectable={workflowSelectable}
              storeWorkflowItemsSelected={storeWorkflowItemsSelected}
              currentWorkflowItem={workflow}
              selectedWorkflowItems={selectedWorkflowItems}
              allowedIntents={allowedIntents}
            />
            <Card
              data-test="selectable-card"
              elevation={workflowSelectable ? 1 : 0}
              key={mapIndex}
              className={`${getCardClass(classes, workflowSortEnabled, status)} ${classes.card}`}
              style={getCardStyle(classes, workflowSortEnabled, status, rejectReason)}
            >
              <div className={classes.workflowContent} data-test={`workflowitem-${id}`}>
                <div className={classes.infoCell}>{infoButton}</div>
                <div className={classes.infoCell}>{attachmentButton}</div>
                <div className={`${classes.text} ${classes.workflowCell}`} style={itemStyle}>
                  <Typography variant="body2" className={classes.typographs}>
                    {displayName}
                  </Typography>
                </div>
                <div className={classes.workflowCell} style={itemStyle}>
                  <Typography
                    variant="body2"
                    className={classes.typographs}
                    component="div"
                    data-test="workflowitem-amount"
                  >
                    {amountType === "N/A"
                      ? amountTypes(amountType)
                      : getAmountField(classes, amount, amountType, exchangeRate, sourceCurrency, targetCurrency)}
                  </Typography>
                </div>
                <div className={classes.workflowCell} data-test="outside">
                  <WorkflowAssigneeContainer
                    workflowitemId={id}
                    workflowitemDisplayName={displayName}
                    disabled={!canAssign}
                    users={users}
                    assignee={assignee}
                    status={status}
                  />
                </div>
                {renderActionButtons(
                  classes,
                  showEdit,
                  editWorkflow.bind(this, workflow.data, props),
                  canViewWorkflowItemPermissions(allowedIntents),
                  () => props.showWorkflowItemPermissions(id, displayName),
                  showClose,
                  () => props.closeWorkflowItem(id),
                  currentWorkflowSelectable,
                  workflowSortEnabled,
                  status,
                  () => props.showWorkflowitemAdditionalData(id),
                  additionalData,
                  idsPermissionsUnassigned,
                  id,
                  rejectReason,
                  () => props.showReasonDialog(rejectReason),
                  () => props.rejectWorkflowItem(id)
                )}
              </div>
            </Card>
          </div>
        );
      }
    )
  )
);

export const RedactedWorkflowItem = withTheme(
  withStyles(styles)(
    SortableElement(
      ({
        classes,
        workflow,
        mapIndex,
        index,
        permissions,
        currentWorkflowSelectable,
        workflowSortEnabled,
        ...props
      }) => {
        const { status } = workflow.data;
        const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
        const itemStyle = workflowSelectable ? { padding: 0 } : { padding: 0, opacity: 0.3 };

        return (
          <div className={classes.container}>
            {createLine(classes, mapIndex === 0, workflowSelectable)}
            <StepDot classes={classes} status={status} selectable={workflowSelectable} redacted={true} />
            <Card
              data-test="redacted-selectable-card"
              elevation={workflowSelectable ? 1 : 0}
              key={mapIndex}
              className={classes.card}
            >
              <div className={classes.workflowContent}>
                <div style={{ flex: 1 }}>
                  <IconButton className={classes.buttonStyle} size="large">
                    <HiddenIcon />
                  </IconButton>
                </div>
                <div style={{ ...itemStyle, ...styles.text, flex: 5 }}>
                  <Typography variant="body2">{strings.workflow.workflow_redacted}</Typography>
                </div>
                <div style={{ ...itemStyle, flex: 5 }}>{null}</div>
                <div style={{ ...styles.chipRow, flex: 2 }}>{null}</div>
                {null}
              </div>
            </Card>
          </div>
        );
      }
    )
  )
);
