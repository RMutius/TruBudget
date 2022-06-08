import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import { withStyles } from "@mui/styles";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Warning from "@mui/icons-material/Warning";
import _isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import strings from "../../../localizeStrings";
import CloseIcon from "@mui/icons-material/Close";
import ActionButton from "../ActionButton";
import OverflowTooltip from "../OverflowTooltip";

const styles = {
  closeButtonContainer: { float: "right", marginTop: -8 },
  closeButtonSize: { fontSize: 15 },
  itemContainer: { maxHeight: "65vh", overflow: "auto", boxShadow: "none" },
  fixLabel: { top: "auto" },
  warning: { marginRight: "8px" },
  warningContainer: { display: "flex", alignItems: "center", justifyContent: "center" },
  select: {
    width: "350px"
  },
  formControlContainer: {
    display: "flex",
    margin: 16,
    justifyContent: "flex-start"
  },
  nameContainer: {
    maxWidth: "200px"
  }
};

const renderSelection = (user, permissionedUser, intent, grant, revoke, myself, disabled) =>
  user.map(u => {
    const checked = permissionedUser.indexOf(u.id) > -1;
    return (
      <MenuItem
        disabled={(u.id === myself && checked) || disabled}
        key={u.id + "selection"}
        value={u.id}
        onClick={checked ? () => revoke(intent, u.id) : () => grant(intent, u.id)}
      >
        <Checkbox checked={checked} disabled={(u.id === myself && checked) || disabled} />
        <ListItemText style={styles.nameContainer}>
          <OverflowTooltip text={u.displayName} />
        </ListItemText>
      </MenuItem>
    );
  });

class PermissionSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
      selectIsOpen: false
    };
  }

  resolveSelections = (userList, permissions) => {
    if (_isEmpty(userList) || _isEmpty(permissions)) return [];

    return permissions.reduce((userdisplaynames, permission) => {
      const user = userList.find(u => u.id === permission);
      if (user) {
        userdisplaynames.push(user.displayName);
      }
      return userdisplaynames;
    }, []);
  };

  renderUserSelection = () => {
    const { classes } = this.props;
    const selection = renderSelection(
      this.props.userList.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup !== true
      ),
      this.props.permissions[this.props.name],
      this.props.name,
      this.props.grant,
      this.props.revoke,
      this.props.myself,
      this.props.disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader className={classes.fixLabel}> {strings.users.users} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  renderGroupSelection = () => {
    const { classes } = this.props;
    const selection = renderSelection(
      this.props.userList.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup === true
      ),
      this.props.permissions[this.props.name],
      this.props.name,
      this.props.grant,
      this.props.revoke,
      this.props.myself,
      this.props.disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader className={classes.fixLabel}> {strings.users.groups} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };
  render() {
    const { classes } = this.props;
    const selections = this.resolveSelections(this.props.userList, this.props.permissions[this.props.name]);
    const selectedUsers = this.renderUserSelection();
    const selectedGroups = this.renderGroupSelection();

    const openSelect = () => {
      if (this.props.onOpen !== undefined) this.props.onOpen();
      this.setState({ selectIsOpen: true });
    };

    const closeSelect = () => {
      this.setState({ searchTerm: "", selectIsOpen: false });
    };
    return (
      <FormControl data-test={`permission-select-${this.props.name}`} key={this.props.name + "form"}>
        <Select
          variant="standard"
          multiple
          className={classes.select}
          autoWidth
          value={selections}
          renderValue={s => s.join(", ")}
          MenuProps={{ "data-test": "permission-selection-popup" }}
          open={this.state.selectIsOpen}
          onOpen={openSelect}
          onClose={closeSelect}
        >
          <div style={styles.closeButtonContainer}>
            <ActionButton
              data-test={"close-select"}
              onClick={closeSelect}
              title={strings.common.close}
              iconButtonStyle={{ width: 15, height: 15 }}
              icon={<CloseIcon style={styles.closeButtonSize} />}
            />
          </div>
          {this.props.disabled ? (
            <ListSubheader className={classes.warningContainer} component="div">
              <Warning className={classes.warning} />
              <Typography data-test="read-only-permissions-text" variant="caption">
                {strings.permissions.read_only}
              </Typography>
            </ListSubheader>
          ) : null}
          <div style={styles.formControlContainer}>
            <FormControl data-test="permission-search">
              <InputLabel>{strings.common.search}</InputLabel>
              <Input value={this.state.searchTerm} onChange={e => this.setState({ searchTerm: e.target.value })} />
            </FormControl>
          </div>
          <div data-test="permission-list">
            <Paper className={classes.itemContainer}>
              <List>
                {selectedUsers}
                {selectedGroups}
              </List>
            </Paper>
          </div>
        </Select>
      </FormControl>
    );
  }
}

export default withStyles(styles)(PermissionSelection);
