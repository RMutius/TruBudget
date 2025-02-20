import React from "react";
import { DatePicker as DatePickerMui } from "@mui/x-date-pickers";
import CancelIcon from "@mui/icons-material/Cancel";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import _isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import strings from "../../localizeStrings";

const styles = {
  searchField: {
    display: "flex",
    flexDirection: "row",
    opacity: "0.8",
    boxShadow: "none"
  },
  clearButton: {
    width: 35,
    height: 35,
    alignSelf: "flex-end",
    marginLeft: "5px"
  }
};

function DatePicker({ name, label, onChange, onDelete, datetime, id = "default" }) {
  const dateValue = _isEmpty(datetime) ? null : datetime;

  const handleOnBlur = (date, name) => {
    const modifiedDate = dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD") : null;
    onChange(modifiedDate, name);
  };

  return (
    <div style={styles.searchField}>
      <form style={styles.form} noValidate>
        <div data-test={`datepicker-${id}`}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePickerMui
              autoOk
              variant="standard"
              id={id}
              label={label}
              placeholder={strings.format.datePlaceholder}
              inputFormat={strings.format.dateFormat}
              value={dateValue}
              onChange={date => {
                onChange(dayjs(date).format("YYYY-MM-DD"), name);
              }}
              onBlur={date => handleOnBlur(date)}
              renderInput={params => <TextField variant="standard" {...params} />}
            />
          </LocalizationProvider>
        </div>
      </form>
      <IconButton data-test={`clear-datepicker-${id}`} onClick={onDelete} style={styles.clearButton} size="large">
        <CancelIcon color="action" />
      </IconButton>
    </div>
  );
}

export default DatePicker;
