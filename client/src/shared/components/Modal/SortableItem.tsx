import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './EditCategoryModal.module.css';
import type { CategoryItem } from '@/shared/types/category';

type SortableItemProps = {
  item: CategoryItem;
  onRemove: (id: number) => void;
};

export function SortableItem({ item, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.row}>
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        {/* You can put an icon here, e.g., a hamburger icon */}
        <svg viewBox="0 0 20 20" width="20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 6zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 12zm0-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 0z" />
        </svg>
      </div>
      <img
        className={styles.thumb}
        src={item.imageUrl}
        alt={item.title}
      />
      <div className={styles.text}>
        <div className={styles.itemTitle}>{item.title}</div>
        <div className={styles.itemSub}>{item.subtitle}</div>
      </div>
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(item.id)}
        type="button"
        aria-label="remove"
      >
        −
      </button>
    </div>
  );
}
