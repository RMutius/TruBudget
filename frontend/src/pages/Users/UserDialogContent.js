import { Typography } from "@mui/material";
import { withStyles } from "@mui/styles";
import NameIcon from "@mui/icons-material/AssignmentInd";
import InfoIcon from "@mui/icons-material/Info";
import OrgaIcon from "@mui/icons-material/StoreMallDirectory";
import React from "react";

import strings from "../../localizeStrings";
import Password from "../Common/Password";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import Username from "../Common/Username";

const styles = {
  textInputContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "30px"
  },
  textInput: {
    width: "50%"
  },
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
    marginLeft: "10px"
  },
  infoIcon: {
    fontSize: 20,
    marginRight: "10px"
  },
  info: {
    display: "flex",
    paddingRight: 20
  },
  customWidth: {},
  createButtonContainer: {},
  createButton: {}
};

const UserDialogContent = ({
  classes,
  user,
  setDisplayName,
  setOrganization,
  setUsername,
  setPassword,
  organization,
  usernameInvalid,
  setConfirmPassword,
  hasNewPasswordFailed
}) => {
  const { displayName, password, username } = user;

  return (
    <div className={classes.container}>
      <span className={classes.info}>
        <InfoIcon className={classes.infoIcon} />
        <Typography variant="body2">{strings.users.privacy_notice}</Typography>
      </span>
      <div className={classes.textInputContainer}>
        <TextInputWithIcon
          className={classes.textInput}
          label={strings.common.organization}
          value={organization}
          data-test="organization"
          disabled={true}
          error={false}
          icon={<OrgaIcon />}
          onChange={event => setOrganization(event.target.value)}
        />
        <TextInputWithIcon
          className={classes.textInput}
          label={strings.users.account_name}
          value={displayName}
          error={false}
          icon={<NameIcon />}
          data-test="accountname"
          onChange={event => setDisplayName(event.target.value)}
        />
        <Username
          username={username}
          storeUsername={setUsername}
          failed={usernameInvalid}
          failedText={strings.users.username_invalid}
          data-test="username"
          id="username"
        />
        <Password
          password={password}
          iconDisplayed={true}
          setPassword={setPassword}
          storePassword={setPassword}
          failed={hasNewPasswordFailed}
          data-test="password-new-user"
        />
        <Password
          iconDisplayed={true}
          setPassword={setConfirmPassword}
          storePassword={setConfirmPassword}
          label={strings.users.new_user_password_confirmation}
          failed={hasNewPasswordFailed}
          data-test="password-new-user-confirm"
          failedText={strings.users.no_password_match}
        />
      </div>
    </div>
  );
};
export default withStyles(styles)(UserDialogContent);
