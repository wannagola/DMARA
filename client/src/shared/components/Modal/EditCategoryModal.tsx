import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import styles from "./EditCategoryModal.module.css";
import type { CategoryItem } from "@/shared/types/category";
import ItemAutocompleteSearch, { LibraryItem } from "../ItemAutocompleteSearch/ItemAutocompleteSearch";
import { SortableItem } from "./SortableItem";

type Props = {
  isOpen: boolean;
  category: string;
  items: CategoryItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onAddItem: (item: LibraryItem) => void;
  onOrderChange: (orderedItems: CategoryItem[]) => void;
};

export default function EditCategoryModal({
  isOpen,
  category,
  items,
  onClose,
  onRemove,
  onAddItem,
  onOrderChange,
}: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const [orderedItems, setOrderedItems] = useState(items);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
      const newIndex = orderedItems.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
      setOrderedItems(newOrder);
      onOrderChange(newOrder); // Notify parent of the change
    }
  }

  if (!isOpen) return null;

  const handleSelectItem = (item: LibraryItem) => {
    onAddItem(item);
    setIsSearching(false);
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div
        className={`${styles.modal} ${isSearching ? styles.searchMode : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{category}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>
        <div className={styles.body}>
          {isSearching ? (
            <div className={styles.addSection}>
              <ItemAutocompleteSearch
                category={category}
                onSelectItem={handleSelectItem}
                onClose={() => setIsSearching(false)}
                existingItems={items}
              />
            </div>
          ) : (
            <>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={orderedItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.list}>
                    {orderedItems.length === 0 && (
                        <div style={{textAlign:'center', color:'#aaa', padding:'20px 0'}}>
                            No items yet. Add your favorite {category}!
                        </div>
                    )}
                    {orderedItems.map((item) => (
                      <SortableItem key={item.id} item={item} onRemove={onRemove} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              
              <div className={styles.addSection}>
                <button
                  className={styles.addButton}
                  onClick={() => setIsSearching(true)}
                  type="button"
                >
                  <div className={styles.addText}>Add your {category}</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
