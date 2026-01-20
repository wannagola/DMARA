import React from "react";
import ReactDatePicker, {
  type ReactDatePickerProps,
} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CustomDatePicker.css"; // We will create this for custom styling

const CustomDatePicker = React.forwardRef<
  ReactDatePicker,
  ReactDatePickerProps
>((props, ref) => {
  return (
    <div className="custom-datepicker-wrapper">
      <ReactDatePicker {...props} ref={ref} />
    </div>
  );
});

export default CustomDatePicker;
