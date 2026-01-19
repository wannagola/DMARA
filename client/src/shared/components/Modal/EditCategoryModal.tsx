import styles from "./EditCategoryModal.module.css";
import type { CategoryItem } from "@/shared/types/category";

type Props = {
  isOpen: boolean;
  category: string;
  items: CategoryItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onAddClick: () => void;
};

export default function EditCategoryModal({
  isOpen,
  category,
  items,
  onClose,
  onRemove,
  onAddClick,
}: Props) {
  if (!isOpen) return null;

  return (
    <>
      {/* overlay 클릭하면 닫힘 */}
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>{category}</h2>

          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.list}>
            {items.map((it) => (
              <div key={it.id} className={styles.row}>
                <button
                  className={styles.removeBtn}
                  onClick={() => onRemove(it.id)}
                  type="button"
                  aria-label="remove"
                >
                  −
                </button>
                <img
                  className={styles.thumb}
                  src={it.imageUrl}
                  alt={it.title}
                />

                <div className={styles.text}>
                  <div className={styles.itemTitle}>{it.title}</div>
                  <div className={styles.itemSub}>{it.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={styles.addButton}
            onClick={onAddClick}
            type="button"
          >
            <div className={styles.addText}>Add your {category}</div>
          </button>
        </div>
      </div>
    </>
  );
}