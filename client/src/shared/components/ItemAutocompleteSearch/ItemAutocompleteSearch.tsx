import { useEffect, useRef, useState } from "react";
import styles from "./ItemAutocompleteSearch.module.css";

export type LibraryItem = {
  id?: number; 
  category: string;
  title: string;
  subtitle: string;
  imageUrl: string;
};

type Props = {
  category: string;
  onSelectItem: (item: LibraryItem) => void;
  onClose: () => void;
  existingItems: { title: string }[];
};

const SEARCH_CATEGORY_MAP: Record<string, string> = {
  "Music": "MUSIC",
  "Movie": "MOVIE",
  "Talent": "ACTOR", 
  "Sports": "SPORTS",
  "Matches": "MATCH",
  "Drama & OTT": "DRAMA",
  "Shows": "EXHIBITION",
};

export default function ItemAutocompleteSearch({
  category,
  onSelectItem,
  onClose,
  existingItems,
}: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LibraryItem[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);

      try {
        let rawResults: any[] = [];

        // 1. Talent 로직: 배우(ACTOR)와 가수(ARTIST) 구분
        if (category === "Talent") {
          const [actorRes, idolRes] = await Promise.all([
            fetch(`http://127.0.0.1:8000/api/hobbies/search/?category=ACTOR&query=${encodeURIComponent(query)}`),
            fetch(`http://127.0.0.1:8000/api/hobbies/search/?category=IDOL&query=${encodeURIComponent(query)}`)
          ]);

          const actorData = await actorRes.json();
          const idolData = await idolRes.json();
          
          // ★ 여기서 각각 "ACTOR", "ARTIST" 태그를 달아줍니다.
          const actors = (actorData.results || []).map((item: any) => ({ ...item, customType: "ACTOR" }));
          const idols = (idolData.results || []).map((item: any) => ({ ...item, customType: "ARTIST" }));

          rawResults = [...actors, ...idols];
        
        } else {
          // 나머지 카테고리
          const backendCategory = SEARCH_CATEGORY_MAP[category] || "ETC";
          const res = await fetch(
            `http://127.0.0.1:8000/api/hobbies/search/?category=${backendCategory}&query=${encodeURIComponent(query)}`
          );
          const data = await res.json();
          rawResults = data.results || [];
        }
        
        // 2. 결과 포맷팅 (여기서 부제를 결정합니다)
        const formattedResults: LibraryItem[] = rawResults.map((item: any, idx: number) => {
            let title = item.title || item.name; 
            let image = item.image || item.image_url || "";
            
            // --- 부제(Subtitle) 결정 로직 ---
            let subtitle = item.subtitle || item.artist || item.date || item.time || "";

            // (A) Talent인 경우: 위에서 붙인 태그 사용
            if (category === "Talent" && item.customType) {
                subtitle = item.customType; 
            }
            // (B) Drama & OTT인 경우: 무조건 "DRAMA" (또는 category) 출력
            else if (category === "Drama & OTT") {
                subtitle = "DRAMA"; 
            }

            // --- 제목 예외 처리 (경기) ---
            if (!title && item.home && item.away) {
                title = `${item.home} vs ${item.away}`;
            }

            return {
                id: idx,
                category: category,
                title: title || "No Title",
                subtitle: subtitle, // 결정된 부제 적용
                imageUrl: image,
            };
        });

        setSuggestions(formattedResults);
        setIsListOpen(true);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
        fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, category]);


  const handleSelectItem = (item: LibraryItem) => {
    onSelectItem(item);
    setQuery("");
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        ref={inputRef}
        className={styles.input}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => {
            if(suggestions.length > 0) setIsListOpen(true);
        }}
        onKeyDown={(e) => {
          if (!isListOpen) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (suggestions.length === 0) return;
            setActiveIndex((prev) => (prev + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (suggestions.length === 0) return;
            setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (suggestions.length > 0) {
              const selectedIndex = activeIndex < 0 ? 0 : activeIndex;
              handleSelectItem(suggestions[selectedIndex]);
            }
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
        placeholder={`Search for ${category}...`}
        autoComplete="off"
      />

      {isListOpen && (
        <div 
            className={styles.autoList} 
            role="listbox"
            onMouseDown={(e) => {
                e.preventDefault(); 
            }}
        >
          {loading ? (
             <div className={styles.noResults}>Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((it, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.autoItem} ${
                  idx === activeIndex ? styles.autoItemActive : ""
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelectItem(it)}
              >
                {it.imageUrl ? (
                    <img className={styles.autoThumb} src={it.imageUrl} alt={it.title} />
                ) : (
                    <div className={styles.autoThumb} style={{background: '#555'}} />
                )}
                
                <div className={styles.autoText}>
                  <div className={styles.autoTitle}>{it.title}</div>
                  <div style={{ fontSize: '14px', color: '#ccc' }}>{it.subtitle}</div>
                </div>
              </button>
            ))
          ) : (
             query && <div className={styles.noResults}>No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}