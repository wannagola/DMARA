import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ItemAutocompleteSearch.module.css";

// This data should eventually come from an API
export type LibraryItem = {
  id: number;
  category: string;
  title: string;
  date: Date;
  imageUrl: string;
};

const CONTENT_LIBRARY: LibraryItem[] = [
  {
    id: 1,
    category: "Exhibitions & Shows",
    title: "Wicked",
    date: new Date("2026-01-16"),
    imageUrl: "/src/assets/items/music1.jpeg",
  },
  {
    id: 2,
    category: "Exhibitions & Shows",
    title: "DEADLINE : WORLD TOUR",
    date: new Date("2025-07-05"),
    imageUrl: "/src/assets/items/music2.jpeg",
  },
  {
    id: 3,
    category: "Movie",
    title: "Interstellar",
    date: new Date("2025-12-24"),
    imageUrl: "/src/assets/items/music3.jpeg",
  },
  {
    id: 4,
    category: "Music",
    title: "Bohemian Rhapsody",
    date: new Date("2018-10-31"),
    imageUrl: "/src/assets/items/music1.jpeg",
  },
  {
    id: 5,
    category: "Music",
    title: "Love wins all",
    date: new Date("2024-01-24"),
    imageUrl: "/src/assets/items/music2.jpeg",
  },
];
// ---

type Props = {
  category: string;
  onSelectItem: (item: LibraryItem) => void;
  onClose: () => void;
  existingItems: { id: number }[];
};

export default function ItemAutocompleteSearch({
  category,
  onSelectItem,
  onClose,
  existingItems,
}: Props) {
  const [query, setQuery] = useState("");
  const [isListOpen, setIsListOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const existingIds = new Set(existingItems.map((it) => it.id));

    const inCategory = CONTENT_LIBRARY.filter(
      (it) => it.category === category && !existingIds.has(it.id)
    );

    if (q.length === 0) return inCategory;

    return inCategory.filter((it) => it.title.toLowerCase().includes(q));
  }, [category, query, existingItems]);

  const handleSelectItem = (item: LibraryItem) => {
    onSelectItem(item);
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [onClose]);

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        className={styles.input}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!isListOpen) setIsListOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(e) => {
          if (!isListOpen) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (filteredSuggestions.length === 0) return;
            setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (filteredSuggestions.length === 0) return;
            setActiveIndex(
              (prev) =>
                (prev - 1 + filteredSuggestions.length) %
                filteredSuggestions.length
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredSuggestions.length > 0) {
              const selectedIndex = activeIndex < 0 ? 0 : activeIndex;
              handleSelectItem(filteredSuggestions[selectedIndex]);
            }
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
        placeholder={`Search for ${category}...`}
        autoComplete="off"
      />

      {isListOpen && (
        <div ref={listRef} className={styles.autoList} role="listbox">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((it, idx) => (
              <button
                key={it.id}
                type="button"
                className={`${styles.autoItem} ${
                  idx === activeIndex ? styles.autoItemActive : ""
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelectItem(it)}
              >
                <img
                  className={styles.autoThumb}
                  src={it.imageUrl}
                  alt={it.title}
                />
                <div className={styles.autoText}>
                  <div className={styles.autoTitle}>{it.title}</div>
                </div>
              </button>
            ))
          ) : (
            <div className={styles.noResults}>No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}
