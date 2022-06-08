import { IconButton } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Subheader from "@mui/material/ListSubheader";
import ProjectIcon from "@mui/icons-material/Business";
import NodesIcon from "@mui/icons-material/DesktopWindows";
import ExportIcon from "@mui/icons-material/ListAlt";
import SocialNotificationIcon from "@mui/icons-material/NotificationsActive";
import UsersIcon from "@mui/icons-material/PeopleOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import StatusIcon from "@mui/icons-material/Build";
import React from "react";
import strings from "../../localizeStrings";
import DownloadBackupButton from "./DownloadBackupButton";
import RestoreBackupButton from "./RestoreBackupButton";

const SideNavCard = ({
  avatarBackground,
  avatar,
  displayName,
  organization,
  nodeDashboardEnabled,
  history,
  groups,
  userId,
  createBackup,
  restoreBackup,
  exportData,
  showUserProfile,
  fetchEmailAddress,
  exportServiceAvailable,
  environment
}) => {
  const openUserProfile = () => {
    fetchEmailAddress();
    showUserProfile();
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto"
      }}
      data-test="side-navigation"
    >
      <div
        style={{
          background: `url('${avatarBackground}') no-repeat`,
          backgroundSize: "cover",
          height: "100px",
          position: "relative",
          width: "100%",
          minWidth: "300px"
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
          <ListItem style={{ paddingTop: "16px" }}>
            <ListItemIcon>
              <IconButton
                children={
                  <ListItemAvatar>
                    <Avatar size={60} src={avatar} />
                  </ListItemAvatar>
                }
                size="large" />
            </ListItemIcon>
            <ListItemText
              style={{ padding: "0px" }}
              primary={<span>{displayName}</span>}
              secondary={<span>{organization}</span>}
            />
            <IconButton
              data-test="show-user-profile"
              onClick={() => openUserProfile()}
              size="large">
              <SettingsIcon />
            </IconButton>
          </ListItem>
        </div>
      </div>
      <List>
        <Subheader>{strings.navigation.selections}</Subheader>
        <ListItem button onClick={() => history.push("/")} data-test="side-navigation-projects">
          <ListItemIcon>
            <ProjectIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.menu_item_projects} />
        </ListItem>
        <ListItem button onClick={() => history.push("/notifications")} data-test="side-navigation-notifications">
          <ListItemIcon>
            <SocialNotificationIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.menu_item_notifications} />
        </ListItem>
        <ListItem button onClick={() => history.push("/users")} data-test="side-navigation-users">
          <ListItemIcon>
            <UsersIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.menu_item_users} />
        </ListItem>
        {nodeDashboardEnabled ? (
          <ListItem button onClick={() => history.push("/nodes")} data-test="side-navigation-nodes">
            <ListItemIcon>
              <NodesIcon />
            </ListItemIcon>
            <ListItemText primary={strings.nodesDashboard.nodes} />
          </ListItem>
        ) : null}
        {exportServiceAvailable ? (
          <ListItem button onClick={() => exportData(environment)} data-test="side-navigation-export">
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText primary={strings.navigation.menu_item_export} />
          </ListItem>
        ) : null}
        <ListItem button onClick={() => history.push("/status")} data-test="side-navigation-service-status">
          <ListItemIcon>
            <StatusIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.service_status} />
        </ListItem>
      </List>
      <Divider />
      {userId === "root" ? (
        <List>
          <Subheader> {strings.navigation.backup} </Subheader>
          <ListItem>
            <DownloadBackupButton createBackup={createBackup} />
            <RestoreBackupButton restoreBackup={restoreBackup} />
          </ListItem>
          <Divider />
        </List>
      ) : null}
      <List>
        {groups.length ? <Subheader> {strings.users.groups} </Subheader> : null}
        {groups.map(group => {
          return (
            <div key={group.groupId}>
              <ListItem>
                <ListItemText primary={group.displayName} secondary={strings.common.id + ": " + group.groupId} />
              </ListItem>
              <Divider />
            </div>
          );
        })}
      </List>
      <div style={{ flexGrow: 1 }} />
    </div>
  );
};

export default SideNavCard;
