import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CommentPage.module.css";
import AddCommentModal, {
  type NewCommentPayload,
} from "@/pages/CommentPage/components/Modal/AddCommentModal.tsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    id: 3,
    category: "Movie",
    title: "Interstellar",
    date: "2026.01.16", // Same date as Wicked
    contentPreview:
      "인생 최고의 영화, OST만 들어도 가슴이 웅장해진다. 우주를 표현하는 방법이...",
    imageUrl: "/src/assets/items/interstellar.png",
    likes: 120,
  },
  {
    id: 4,
    category: "Music",
    title: "Dynamite",
    date: "2026.01.16", // Same date as Wicked
    contentPreview:
      "신나는 음악! BTS는 역시 최고다. 스트레스가 확 풀리는 느낌!",
    imageUrl: "/src/assets/items/dynamite.png",
    likes: 200,
  },
  {
    id: 2,
    category: "Exhibitions & Shows",
    title: "DEADLINE : WORLD TOUR",
    date: "2025.07.05",
    contentPreview:
      "오늘은 바로 기다리고 기다리던 콘서트를 다녀온 날이다! 아침 일찍부터 준비를 하고 셔틀버스를...",
    imageUrl: "/src/assets/items/deadline.png",
    likes: 33,
  },
  {
    id: 5,
    category: "Sports",
    title: "UEFA Champions League Final",
    date: "2026.01.20",
    contentPreview:
      "역대급 경기가 펼쳐졌다! 메시의 드리블은 역시 신계의 움직임이었다.",
    imageUrl: "/src/assets/items/champions_league.png",
    likes: 88,
  },
  {
    id: 6,
    category: "Movie",
    title: "Avatar 2",
    date: "2026.01.20",
    contentPreview:
      "황홀한 영상미에 넋을 잃었다. 3D로 보니 더욱 실감나고 스토리가 탄탄하다.",
    imageUrl: "/src/assets/items/avatar2.png",
    likes: 150,
  },
];

type TabKey = "MY" | "FRIENDS";

function SortableCommentCard({
  item,
  isLiked,
  menuOpenId,
  handleLikeToggle,
  toggleMenu,
  deleteItem,
}: {
  item: CommentItem;
  isLiked: boolean;
  menuOpenId: number | null;
  handleLikeToggle: (e: React.MouseEvent, id: number) => void;
  toggleMenu: (e: React.MouseEvent, id: number) => void;
  deleteItem: (e: React.MouseEvent, id: number) => void;
}) {
  const navigate = useNavigate();
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
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.card}
      onClick={() => navigate(`/comment/${item.id}`)}
    >
      <img className={styles.poster} src={item.imageUrl} alt={item.title} />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.meta}>
            <div className={styles.category}>{item.category}</div>
            <div className={styles.title}>{item.title}</div>
            <div className={styles.date}>{item.date}</div>
          </div>
          <div className={styles.rightTop}>
            <button
              type="button"
              className={styles.moreBtn}
              onClick={(e) => toggleMenu(e, item.id)}
              aria-label="more"
            >
              •••
            </button>
            {menuOpenId === item.id && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={(e) => deleteItem(e, item.id)}
              >
                DELETE
              </button>
            )}
          </div>
        </div>
        <p className={styles.preview}>{item.contentPreview}</p>
      </div>

      <div
        className={styles.likeBox}
        onClick={(e) => handleLikeToggle(e, item.id)}
      >
        <button className={styles.heartButton} aria-label="Like">
          <svg
            className={`${styles.heart} ${isLiked ? styles.liked : ""}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        <div className={styles.likeCount}>{item.likes}</div>
      </div>
    </article>
  );
}

export default function CommentPage() {
  const [tab, setTab] = useState<TabKey>("MY");
  const [items, setItems] = useState<CommentItem[]>(initialItems);
  const [likedIds, setLikedIds] = useState(new Set<number>());
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

  const handleLikeToggle = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent navigation
    const newLikedIds = new Set(likedIds);
    const isLiked = likedIds.has(id);

    if (isLiked) {
      newLikedIds.delete(id);
    } else {
      newLikedIds.add(id);
    }
    setLikedIds(newLikedIds);

    // Also update the master items array
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, likes: item.likes + (isLiked ? -1 : 1) };
        }
        return item;
      }),
    );
  };

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const deleteItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  }

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleItems.map((it) => it.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.list}>
            {visibleItems.map((it) => {
              const isLiked = likedIds.has(it.id);
              return (
                <SortableCommentCard
                  key={it.id}
                  item={it}
                  isLiked={isLiked}
                  menuOpenId={menuOpenId}
                  handleLikeToggle={handleLikeToggle}
                  toggleMenu={toggleMenu}
                  deleteItem={deleteItem}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

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
