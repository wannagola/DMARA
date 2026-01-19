import { useMemo, useState } from "react";
import styles from "./CommentPage.module.css";
import AddCommentModal, {
  type NewCommentPayload,
} from "@/pages/CommentPage/components/Modal/AddCommentModal.tsx";

export type CommentItem = {
  id: number;
  category: string;
  title: string;
  date: string; // YYYY.MM.DD
  contentPreview: string;
  imageUrl: string;
  likes: number;
};

const initialItems: CommentItem[] = [
  {
    id: 1,
    category: "Exhibitions & Shows",
    title: "Wicked",
    date: "2026.01.16",
    contentPreview:
      "오늘 뮤지컬 Wicked를 보고 왔다. 생각보다 내용이 무거워서 조금 놀랐다. 엘파바가 단순히 나쁜 ...",
    imageUrl: "/src/assets/items/wicked.png",
    likes: 57,
  },
  {
    id: 2,
    category: "Exhibitions & Shows",
    title: "DEADLINE : WORLD TOUR...",
    date: "2025.07.05",
    contentPreview:
      "오늘은 바로 기다리고 기다리던 콘서트를 다녀온 날이다! 아침 일찍부터 준비를 하고 셔틀버스를...",
    imageUrl: "/src/assets/items/deadline.png",
    likes: 33,
  },
];

type TabKey = "MY" | "FRIENDS";

export default function CommentPage() {
  const [tab, setTab] = useState<TabKey>("MY");

  const [items, setItems] = useState<CommentItem[]>(initialItems);

  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Add modal state

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [category, setCategory] = useState("Exhibitions & Shows");

  const [title, setTitle] = useState("");

  const [date, setDate] = useState<Date | null>(null);

  const [comment, setComment] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const visibleItems = useMemo(() => {
    return items;
  }, [items]);

  const toggleMenu = (id: number) => {
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));

    setMenuOpenId(null);
  };

  const openAdd = () => {
    setMenuOpenId(null);

    // Reset form state

    setCategory("Exhibitions & Shows");

    setTitle("");

    setDate(null);

    setComment("");

    setFile(null);

    setIsAddOpen(true);
  };

  const closeAdd = () => setIsAddOpen(false);

  const handleAddSubmit = (payload: NewCommentPayload) => {
    const nextId = (items[0]?.id ?? 0) + 1;

    const yyyy = payload.date.getFullYear();

    const mm = String(payload.date.getMonth() + 1).padStart(2, "0");

    const dd = String(payload.date.getDate()).padStart(2, "0");

    const newItem: CommentItem = {
      id: nextId,

      category: payload.category,

      title: payload.title,

      date: `${yyyy}.${mm}.${dd}`,

      contentPreview: payload.comment,

      imageUrl: payload.imagePreviewUrl ?? "/src/assets/items/placeholder.png",

      likes: 0,
    };

    setItems((prev) => [newItem, ...prev]);

    closeAdd();
  };

  return (
    <div className={styles.page}>
      {/* sub tab bar */}

      <div className={styles.subTabWrap}>
        <button
          type="button"
          className={`${styles.subTab} ${tab === "MY" ? styles.active : ""}`}
          onClick={() => setTab("MY")}
        >
          My Comment
        </button>

        <button
          type="button"
          className={`${styles.subTab} ${
            tab === "FRIENDS" ? styles.active : ""
          }`}
          onClick={() => setTab("FRIENDS")}
        >
          Friends
        </button>
      </div>

      <div className={styles.list}>
        {visibleItems.map((it) => (
          <article key={it.id} className={styles.card}>
            <img className={styles.poster} src={it.imageUrl} alt={it.title} />

            <div className={styles.content}>
              <div className={styles.topRow}>
                <div className={styles.meta}>
                  <div className={styles.category}>{it.category}</div>

                  <div className={styles.title}>{it.title}</div>

                  <div className={styles.date}>{it.date}</div>
                </div>

                <div className={styles.rightTop}>
                  <button
                    type="button"
                    className={styles.moreBtn}
                    onClick={() => toggleMenu(it.id)}
                    aria-label="more"
                  >
                    •••
                  </button>

                  {menuOpenId === it.id && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => deleteItem(it.id)}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>

              <p className={styles.preview}>{it.contentPreview}</p>
            </div>

            <div className={styles.likeBox}>
              <div className={styles.heart} aria-hidden="true" />

              <div className={styles.likeCount}>{it.likes}</div>
            </div>
          </article>
        ))}
      </div>

      {/* floating add */}

      <button type="button" className={styles.fab} onClick={openAdd}>
        Add
      </button>

      <footer className={styles.footer}>
        © 2026 D_MARA. All Rights Reserved.
      </footer>

      {/* Add modal (레퍼런스 스타일) */}

      <AddCommentModal
        isOpen={isAddOpen}
        onClose={closeAdd}
        onSubmit={handleAddSubmit}
        category={category}
        setCategory={setCategory}
        title={title}
        setTitle={setTitle}
        date={date}
        setDate={setDate}
        comment={comment}
        setComment={setComment}
        file={file}
        setFile={setFile}
      />
    </div>
  );
}
