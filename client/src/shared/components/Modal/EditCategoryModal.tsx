import { useState } from "react";
import styles from "./EditCategoryModal.module.css";
import type { CategoryItem } from "@/shared/types/category";
import ItemAutocompleteSearch, { LibraryItem } from "../ItemAutocompleteSearch/ItemAutocompleteSearch";

type Props = {
  isOpen: boolean;
  category: string;
  items: CategoryItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onAddItem: (item: LibraryItem) => void;
};

export default function EditCategoryModal({
  isOpen,
  category,
  items,
  onClose,
  onRemove,
  onAddItem,
}: Props) {
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSelectItem = (item: LibraryItem) => {
    // 1. 아이템 추가 함수 호출 (OnboardingPage로 전달)
    onAddItem(item);
    // 2. 검색 모드 종료 (목록 화면으로 복귀)
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
              {/* 검색 컴포넌트 */}
              <ItemAutocompleteSearch
                category={category}
                onSelectItem={handleSelectItem}
                onClose={() => setIsSearching(false)}
                existingItems={items} // 중복 체크용 (선택 사항)
              />
            </div>
          ) : (
            <>
              {/* 목록 표시 영역 */}
              <div className={styles.list}>
                {items.length === 0 && (
                    <div style={{textAlign:'center', color:'#aaa', padding:'20px 0'}}>
                        No items yet. Add your favorite {category}!
                    </div>
                )}
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
              
              {/* 추가 버튼 */}
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