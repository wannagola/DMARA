import React from "react";
import styles from "./AddCommentModal.module.css";

export const DateInputWithIcon = React.forwardRef<
  HTMLInputElement,
  {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
>(({ value, onClick, placeholder, onChange }, ref) => (
  <div className={styles.inputWrapper} onClick={onClick}>
    <input
      ref={ref}
      className={styles.input}
      readOnly
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
    <span className={styles.calendarIcon} aria-hidden="true" />
  </div>
));

DateInputWithIcon.displayName = "DateInputWithIcon";

