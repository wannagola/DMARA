import { useEffect, useRef, useState } from "react";
import styles from "./ItemAutocompleteSearch.module.css";
import BACKEND_URL from "@/config";

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

        // 1. Talent 로직
        if (category === "Talent") {
          const [actorRes, idolRes] = await Promise.all([
            fetch(`${BACKEND_URL}/api/hobbies/search/?category=ACTOR&query=${encodeURIComponent(query)}`),
            fetch(`${BACKEND_URL}/api/hobbies/search/?category=IDOL&query=${encodeURIComponent(query)}`)
          ]);

          const actorData = await actorRes.json();
          const idolData = await idolRes.json();
          
          const actors = (actorData.results || []).map((item: any) => ({ ...item, customType: "ACTOR" }));
          const idols = (idolData.results || []).map((item: any) => ({ ...item, customType: "ARTIST" }));

          rawResults = [...idols, ...actors];
        
        } else {
          // 나머지 카테고리
          const backendCategory = SEARCH_CATEGORY_MAP[category] || "ETC";
          const res = await fetch(
            `${BACKEND_URL}/api/hobbies/search/?category=${backendCategory}&query=${encodeURIComponent(query)}`
          );
          const data = await res.json();
          rawResults = data.results || [];
        }
        
        // 2. 결과 포맷팅 & 부제 결정
        const formattedResults: LibraryItem[] = rawResults.map((item: any, idx: number) => {
            let title = item.title || item.name; 
            let image = item.image || item.image_url || "";
            
            // 기본 부제 (가수명, 날짜 등)
            let subtitle = item.subtitle || item.artist || item.date || item.time || "";

            // (A) Talent: ACTOR / ARTIST 구분
            if (category === "Talent" && item.customType) {
                subtitle = item.customType; 
            }
            // ★ (B) Drama & OTT: TMDB 장르 정보 사용
            else if (category === "Drama & OTT") {
                // 1순위: item.genre (단일 문자열)
                if (item.genre) {
                    subtitle = item.genre;
                } 
                // 2순위: item.genres (배열일 경우 콤마로 연결)
                else if (Array.isArray(item.genres) && item.genres.length > 0) {
                    subtitle = item.genres.join(", ");
                }
                // 3순위: 데이터가 아예 없으면 기본값
                else {
                    subtitle = "DRAMA";
                }
            }

            // (C) Movie: 영화도 장르가 오면 보여주기 (선택 사항)
            else if (category === "Movie") {
                 if (item.genre) subtitle = item.genre;
                 else if (Array.isArray(item.genres)) subtitle = item.genres.join(", ");
            }

            // --- 제목 예외 처리 (경기) ---
            if (!title && item.home && item.away) {
                title = `${item.home} vs ${item.away}`;
            }

            return {
                id: idx,
                category: category,
                title: title || "No Title",
                subtitle: subtitle, 
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