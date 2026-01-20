import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WhoAmIEditPage.module.css";
import { CATEGORIES, CategoryKey } from "@/shared/constants/categories";
import type { CategoryItem } from "@/shared/types/category";
import Modal from "@/shared/components/Modal/Modal";
import ItemAutocompleteSearch, {
  LibraryItem,
} from "@/shared/components/ItemAutocompleteSearch/ItemAutocompleteSearch";

// 백엔드 카테고리 코드 매핑
const BACKEND_CATEGORY_MAP: Record<string, string> = {
  Music: "MUSIC",
  Movie: "MOVIE",
  Talent: "ACTOR", // Talent는 ACTOR/IDOL을 포함하므로 대표로 ACTOR 사용
  Sports: "SPORTS",
  Matches: "MATCH",
  "Drama & OTT": "DRAMA",
  Shows: "EXHIBITION",
};

export default function WhoAmIEditPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Record<CategoryKey, CategoryItem[]>>({
    Music: [],
    Movie: [],
    Talent: [],
    Sports: [],
    Matches: [],
    "Drama & OTT": [],
    Shows: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(
    null,
  );

  // 데이터 로딩
  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;
      try {
        const res = await fetch("http://127.0.0.1:8000/api/hobbies/items/", {
          headers: { Authorization: `Token ${token}` },
        });
        if (res.ok) {
          const data = await res.json();

          const newItemsState = { ...items };

          // API 데이터를 프론트엔드 카테고리 키에 맞게 그룹화
          CATEGORIES.forEach((catName) => {
            const backendCode = BACKEND_CATEGORY_MAP[catName] || catName;

            const categoryItems = data
              .filter((item: any) => item.category === backendCode)
              .map((item: any) => ({
                // 데이터 형식 변환
                ...item,
                imageUrl: item.image_url || item.image || "",
              }));

            // Talent는 ACTOR와 IDOL을 합쳐야 함
            if (catName === "Talent") {
              const idolItems = data
                .filter((item: any) => item.category === "IDOL")
                .map((item: any) => ({
                  ...item,
                  imageUrl: item.image_url || item.image || "",
                }));
              newItemsState[catName] = [...categoryItems, ...idolItems];
            } else {
              newItemsState[catName] = categoryItems;
            }
          });

          setItems(newItemsState);
        }
      } catch (err) {
        console.error("Failed to fetch items", err);
      }
    };
    fetchItems();
  }, []);

  const handleOpenModal = (category: CategoryKey) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleAddItem = (newItem: LibraryItem) => {
    if (!selectedCategory) return;

    // LibraryItem을 CategoryItem으로 변환
    const newCategoryItem: CategoryItem = {
      // id는 임시로 Date.now() 사용. 백엔드에서 실제 id를 부여해야 함.
      id: Date.now() + Math.random(),
      title: newItem.title,
      subtitle: newItem.subtitle,
      imageUrl: newItem.imageUrl,
      // API 전송 시에는 백엔드 코드로 보내야 함
      category: selectedCategory,
    };

    setItems((prev) => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], newCategoryItem],
    }));
    handleCloseModal();
  };

  const handleRemoveItem = (category: CategoryKey, itemId: number) => {
    setItems((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== itemId),
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Please log in.");
      return;
    }

    // 프론트엔드 상태를 백엔드로 보낼 payload로 변환
    const payload = Object.entries(items).flatMap(
      ([categoryName, categoryItems]) => {
        return categoryItems.map((item) => {
          const backendCategory =
            BACKEND_CATEGORY_MAP[categoryName as CategoryKey] || categoryName;

          // Talent의 경우, subtitle을 보고 ACTOR/ARTIST 구분
          let finalCategory = backendCategory;
          if (categoryName === "Talent") {
            if (item.subtitle === "ARTIST") finalCategory = "IDOL";
            else if (item.subtitle === "ACTOR") finalCategory = "ACTOR";
          }

          return {
            title: item.title,
            category: finalCategory,
            image_url: item.imageUrl,
            // subtitle은 백엔드 모델에 따라 포함 여부 결정 (현재는 미포함)
          };
        });
      },
    );

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/hobbies/items/bulk_update/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        alert("Saved successfully!");
        navigate("/whoami");
      } else {
        const errorData = await res.json();
        alert("Failed to save: " + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("An error occurred while saving.");
    }
  };

  return (
    <>
      <div className={styles.page}>
        <h1 className={styles.title}>WhoAmI 등록 / 편집</h1>
        <button onClick={handleSave} className={styles.saveButton}>
          Save
        </button>

        {CATEGORIES.map((category) => (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {category}
              <button
                className={styles.addButton}
                onClick={() => handleOpenModal(category)}
              >
                + 추가
              </button>
            </h2>
            <div className={styles.itemGrid}>
              {items[category].map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <img
                    className={styles.thumb}
                    src={item.imageUrl}
                    alt={item.title}
                  />
                  <div className={styles.info}>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemSubtitle}>{item.subtitle}</div>
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleRemoveItem(category, item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Add to ${selectedCategory}`}
      >
        {selectedCategory && (
          <ItemAutocompleteSearch
            category={selectedCategory}
            onSelectItem={handleAddItem}
            onClose={handleCloseModal}
            existingItems={items[selectedCategory]}
          />
        )}
      </Modal>
    </>
  );
}
