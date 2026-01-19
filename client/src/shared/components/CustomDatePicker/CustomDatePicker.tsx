import ReactDatePicker, { type ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CustomDatePicker.css"; // We will create this for custom styling

export default function CustomDatePicker(props: ReactDatePickerProps) {
  return (
    <div className="custom-datepicker-wrapper">
      <ReactDatePicker {...props} />
    </div>
  );
}
