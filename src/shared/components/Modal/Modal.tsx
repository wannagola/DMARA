import { useEffect } from "react";
import styles from "./Modal.module.css";

type Props = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, title, onClose, children }: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>

          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        {/* ✅ children을 감싸는 content 래퍼 */}
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}
