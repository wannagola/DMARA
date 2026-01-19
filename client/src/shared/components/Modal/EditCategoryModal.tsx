import { useState } from "react";
import styles from "./EditCategoryModal.module.css";
import type { CategoryItem } from "@/shared/types/category";
import { CategoryKey } from "@/shared/constants/categories";

type Props = {
  isOpen: boolean;
  category: CategoryKey;
  items: CategoryItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onItemAdded: () => void;
};

// 기본 매핑 테이블 (Talent는 로직에서 별도 처리하므로 여기서 빠져도 되지만, 기본값으로 둡니다)
const SEARCH_CATEGORY_MAP: Record<CategoryKey, string> = {
  "Music": "MUSIC",
  "Movie": "MOVIE",
  "Talent": "ACTOR",      // ★ Talent는 로직에서 ACTOR + IDOL 합쳐서 검색함
  "Sports": "SPORTS",
  "Matches": "MATCH",
  "Drama & OTT": "DRAMA",
  "Shows": "EXHIBITION",  // ★ ETC -> EXHIBITION으로 수정됨!
};

export default function EditCategoryModal({
  isOpen,
  category,
  items,
  onClose,
  onRemove,
  onItemAdded,
}: Props) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  // 1. 검색 실행 (GET)
  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchResults([]); // 초기화

    try {
      let mergedResults: any[] = [];

      // ★ [수정됨] Talent인 경우: ACTOR와 IDOL을 둘 다 검색해서 합침
      if (category === "Talent") {
        const [actorRes, idolRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/hobbies/search/?category=ACTOR&query=${encodeURIComponent(query)}`),
          fetch(`http://127.0.0.1:8000/api/hobbies/search/?category=IDOL&query=${encodeURIComponent(query)}`)
        ]);

        const actorData = await actorRes.json();
        const idolData = await idolRes.json();

        // 두 결과를 합침 (중복 제거 로직이 필요하다면 추가 가능)
        mergedResults = [...(actorData.results || []), ...(idolData.results || [])];
      
      } else {
        // 나머지 카테고리는 매핑 테이블대로 하나만 검색
        // Shows -> EXHIBITION으로 자동 변환됨
        const backendCategory = SEARCH_CATEGORY_MAP[category] || "ETC";
        
        const res = await fetch(
          `http://127.0.0.1:8000/api/hobbies/search/?category=${backendCategory}&query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        mergedResults = data.results || [];
      }

      setSearchResults(mergedResults);

    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  // 2. 아이템 추가 (POST)
  const handleAddItem = async (resultItem: any) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 데이터 필드 정리 (API마다 주는 필드명이 조금씩 다를 수 있음)
      let title = resultItem.title;
      let subtitle = resultItem.subtitle || resultItem.artist || resultItem.date || "";
      let imageUrl = resultItem.image || resultItem.image_url || "";

      // Match(경기)인 경우 제목 생성 예외처리
      if (!title && resultItem.home && resultItem.away) {
        title = `${resultItem.home} vs ${resultItem.away}`;
        subtitle = resultItem.time || resultItem.date || "";
      }

      const res = await fetch("http://127.0.0.1:8000/api/hobbies/items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          category: category, 
          title: title || "제목 없음",
          subtitle: subtitle,
          image_url: imageUrl, 
        }),
      });

      if (res.ok) {
        onItemAdded(); 
        alert("추가되었습니다!");
      } else {
        alert("추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("추가 에러:", error);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Edit {category}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* --- 내 리스트 --- */}
        <div className={styles.myList}>
          <h3>My List</h3>
          {items.length === 0 ? (
            <p className={styles.emptyText}>아직 추가된 항목이 없습니다.</p>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.id} className={styles.itemRow}>
                  <img src={item.imageUrl} alt={item.title} className={styles.smallThumb}/>
                  <div className={styles.textInfo}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <p className={styles.itemSub}>{item.subtitle}</p>
                  </div>
                  <button onClick={() => onRemove(item.id)} className={styles.delBtn}>삭제</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr className={styles.divider} />

        {/* --- 검색 영역 --- */}
        <div className={styles.searchSection}>
          <h3>Add New</h3>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder={`Search ${category}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className={styles.searchInput}
            />
            <button onClick={handleSearch} disabled={isSearching} className={styles.searchBtn}>
              {isSearching ? "..." : "Search"}
            </button>
          </div>

          <div className={styles.resultArea}>
            {searchResults.map((res, idx) => {
               const imgUrl = res.image || res.image_url;
               // 제목이 없으면 home vs away 로 대체 (Match 대응)
               const title = res.title || (res.home ? `${res.home} vs ${res.away}` : "No Title");
               const sub = res.subtitle || res.artist || res.date || res.time || "";

               return (
                <div key={idx} className={styles.resultItem} onClick={() => handleAddItem(res)}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={title} />
                  ) : (
                    <div className={styles.noImage} />
                  )}
                  <div className={styles.resultInfo}>
                    <p className={styles.resTitle}>{title}</p>
                    <p className={styles.resSub}>{sub}</p>
                  </div>
                  <span className={styles.addIcon}>+</span>
                </div>
              );
            })}
            
            {/* 검색 결과가 0개일 때 메시지 */}
            {!isSearching && query && searchResults.length === 0 && (
              <p className={styles.noResultText}>검색 결과가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}