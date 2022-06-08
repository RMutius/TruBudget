import { withStyles } from "@mui/styles";
import React from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import strings from "../../localizeStrings";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "100%",
    marginTop: "40px"
  }
};

const filterDeclinedNodes = (nodes, organization) => {
  return nodes.filter(node => {
    if (node.currentAccess.decliners.length > 0) {
      return !node.currentAccess.decliners.forEach(declinerObject => {
        return declinerObject.organization === organization;
      });
    } else return false;
  });
};

const getDeclinersString = decliners => {
  let resultString = "";
  let stringArray = [];
  if (decliners.length > 0) {
    decliners.forEach(declinerObject => {
      stringArray.push(declinerObject.organization);
    });
    resultString = `${stringArray.join(", ")}`;
  }
  return resultString;
};

const getListEntries = declinedNodes => {
  if (declinedNodes.length) {
    return declinedNodes.map(node => {
      return (
        <TableRow key={node.address.address}>
          <TableCell align="right">{node.address.organization}</TableCell>
          <TableCell align="center">{node.address.address}</TableCell>
          <TableCell align="left">{getDeclinersString(node.currentAccess.decliners)}</TableCell>
        </TableRow>
      );
    });
  }
};

const DeclinedNodesTable = props => {
  const { classes, nodes, organization } = props;
  const declinedNodes = filterDeclinedNodes(nodes, organization);

  const declinedNodesListEntries = getListEntries(declinedNodes, classes);

  return (
    <Paper data-test="declined-nodes-table">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="right">{strings.common.organization}</TableCell>
            <TableCell align="center">{strings.nodesDashboard.nodes}</TableCell>
            <TableCell align="left">{strings.nodesDashboard.declined_by}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody data-test="declined-nodes-table-body">{declinedNodesListEntries}</TableBody>
      </Table>
    </Paper>
  );
};

export default withStyles(styles)(DeclinedNodesTable);
