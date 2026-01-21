import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CommentPage.module.css";
import AddCommentModal, {
  type NewCommentPayload,
} from "@/pages/CommentPage/components/Modal/AddCommentModal";
import BACKEND_URL from "@/config";

export type CommentItem = {
  id: number;
  category: string;
  title: string;
  date: string;
  contentPreview: string;
  posterUrl: string;
  userImageUrl: string | null;
  likes: number;
  isOwner: boolean;
  isLiked: boolean;
  nickname: string;
};

const TO_BACKEND_CATEGORY: Record<string, string> = {
  "Exhibitions & Shows": "SHOW",
  "Movie": "MOVIE",
  "Music": "MUSIC",
  "Sports": "SPORTS",
  "Talent": "ACTOR",
  "Matches": "MATCH",
  "TV": "DRAMA",
  "Shows": "SHOW",
  "Etc": "ETC"
};

export default function CommentPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"MY" | "FRIENDS">("MY");
  
  const [items, setItems] = useState<CommentItem[]>([]);
  const [likedIds, setLikedIds] = useState(new Set<number>());
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [category, setCategory] = useState("Exhibitions & Shows");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [existingUserImage, setExistingUserImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        const res = await fetch(`${BACKEND_URL}/api/posts/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const loadedItems = data.map((it: any) => ({
            id: it.id,
            category: it.category, 
            title: it.title,
            date: it.date_str || it.date,
            contentPreview: it.content,
            posterUrl: it.poster_url || "",
            userImageUrl: it.user_image || null,
            likes: it.likes_count || 0,
            isOwner: it.is_owner,
            isLiked: it.is_liked,
            nickname: it.nickname || it.author_name || it.username || "Unknown",
          }));
          setItems(loadedItems);

          const initialLikedIds = new Set<number>();
          loadedItems.forEach((item: any) => {
            if (item.isLiked) initialLikedIds.add(item.id);
          });
          setLikedIds(initialLikedIds);
        }
      } catch (e) { console.error(e); }
    };
    fetchComments();
  }, []);

  const visibleItems = useMemo(() => {
    return tab === "MY" ? items.filter((it) => it.isOwner) : items.filter((it) => !it.isOwner);
  }, [items, tab]);

  const handleLikeToggle = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const isLiked = likedIds.has(id);
    const newLikedIds = new Set(likedIds);
    if (isLiked) newLikedIds.delete(id);
    else newLikedIds.add(id);
    setLikedIds(newLikedIds);
    
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, likes: it.likes + (isLiked ? -1 : 1) } : it));

    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/api/posts/${id}/like/`, {
            method: "POST",
            headers: { Authorization: `Token ${token}` },
        });
      } catch(err) { console.error(err); }
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const handleEdit = (e: React.MouseEvent, item: CommentItem) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setEditId(item.id);
    setCategory(item.category); 
    setTitle(item.title);
    setComment(item.contentPreview);
    setExistingUserImage(item.userImageUrl);
    setFile(null);

    if (item.date) {
        const parts = item.date.split('.');
        if(parts.length === 3) {
            setDate(new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2])));
        } else {
            setDate(new Date());
        }
    } else {
        setDate(new Date());
    }
    setIsAddOpen(true);
  };

  const deleteItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete?")) return;

    const token = localStorage.getItem("userToken");
    try {
        const res = await fetch(`${BACKEND_URL}/api/posts/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Token ${token}` },
        });
        if(res.ok) {
            setItems((prev) => prev.filter((it) => it.id !== id));
        } else {
            alert("삭제 실패");
        }
    } catch(e) { console.error(e); }
    setMenuOpenId(null);
  };

  const openAdd = () => {
    setMenuOpenId(null);
    setEditId(null);
    setCategory("Exhibitions & Shows");
    setTitle("");
    setDate(null);
    setComment("");
    setFile(null);
    setExistingUserImage(null);
    setIsAddOpen(true);
  };

  const closeAdd = () => setIsAddOpen(false);

  const handleAddSubmit = async (payload: NewCommentPayload) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    const yyyy = payload.date.getFullYear();
    const mm = String(payload.date.getMonth() + 1).padStart(2, "0");
    const dd = String(payload.date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const backendCategory = TO_BACKEND_CATEGORY[payload.category] || "ETC";

    const formData = new FormData();
    formData.append("category", backendCategory);
    formData.append("title", payload.title);
    formData.append("date", dateStr);
    formData.append("content", payload.comment);
    
    if (payload.posterUrl) {
        formData.append("poster_url", payload.posterUrl);
    }
    
    // ✅ [수정] 파일 처리 로직 변경
    if (payload.isImageDeleted) {
        // 이미지를 삭제한 경우, 빈 문자열을 보내서 서버에서 지우도록 요청
        formData.append("user_image", ""); 
    } else if (payload.file) {
        // 새 파일이 있는 경우
        formData.append("user_image", payload.file);
    }

    const url = editId ? `${BACKEND_URL}/api/posts/${editId}/` : `${BACKEND_URL}/api/posts/`;
    const method = editId ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: { Authorization: `Token ${token}` },
            body: formData,
        });

        if (res.ok) {
            const newItemData = await res.json();
            const newItem: CommentItem = {
                id: newItemData.id,
                category: newItemData.category,
                title: newItemData.title,
                date: newItemData.date_str || dateStr.replace(/-/g, '.'),
                contentPreview: newItemData.content,
                posterUrl: newItemData.poster_url,
                userImageUrl: newItemData.user_image,
                likes: newItemData.likes_count || 0,
                isOwner: true,
                isLiked: false,
                nickname: newItemData.nickname || "Me", 
            };

            if (editId) {
                setItems(prev => prev.map(it => it.id === editId ? newItem : it));
            } else {
                setItems(prev => [newItem, ...prev]);
            }
            closeAdd();
        } else {
            alert("저장 실패");
        }
    } catch (e) {
        console.error(e);
        alert("네트워크 오류");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.subTabWrap}>
        <button className={`${styles.subTab} ${tab === "MY" ? styles.active : ""}`} onClick={() => setTab("MY")}>My Comment</button>
        <button className={`${styles.subTab} ${tab === "FRIENDS" ? styles.active : ""}`} onClick={() => setTab("FRIENDS")}>Friends</button>
      </div>

      <div className={styles.list}>
        {visibleItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            {tab === "MY" ? "아직 작성한 코멘트가 없습니다." : "친구들의 코멘트가 없습니다."}
          </div>
        )}
        {visibleItems.map((it) => {
          const isLiked = likedIds.has(it.id);
          return (
            <article
              key={it.id}
              className={styles.card}
              onClick={() => navigate(`/comment/${it.id}`)}
            >
              <img
                className={styles.poster}
                src={it.posterUrl || "/src/assets/items/placeholder.png"}
                alt={it.title}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />

              <div className={styles.content}>
                
                {!it.isOwner && (
                    <div className={styles.authorBadge}>
                        By. {it.nickname}
                    </div>
                )}

                <div className={styles.topRow}>
                  <div className={styles.meta}>
                    <div className={styles.category}>{it.category}</div>
                    <div className={styles.title}>{it.title}</div>
                    <div className={styles.date}>{it.date}</div>
                  </div>

                  {it.isOwner && (
                    <div className={styles.rightTop}>
                        <button
                        type="button"
                        className={styles.moreBtn}
                        onClick={(e) => toggleMenu(e, it.id)}
                        >
                        •••
                        </button>
                        {menuOpenId === it.id && (
                        <div className={styles.menuDropdown}>
                            <button
                            type="button"
                            className={`${styles.menuItem} ${styles.editBtn}`}
                            onClick={(e) => handleEdit(e, it)}
                            >
                            EDIT
                            </button>
                            <button
                            type="button"
                            className={`${styles.menuItem} ${styles.deleteBtn}`}
                            onClick={(e) => deleteItem(e, it.id)}
                            >
                            DELETE
                            </button>
                        </div>
                        )}
                    </div>
                  )}
                </div>

                {/* ✅ [수정] 여기서 userImageUrl 렌더링 부분 삭제함 (리스트에서 사진 숨김) */}
                <p className={styles.preview}>{it.contentPreview}</p>
              </div>

              <div className={styles.likeBox} onClick={(e) => handleLikeToggle(e, it.id)}>
                <button className={styles.heartButton}>
                  <svg className={`${styles.heart} ${isLiked ? styles.liked : ""}`} viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <div className={styles.likeCount}>{it.likes}</div>
              </div>
            </article>
          );
        })}
      </div>

      <button type="button" className={styles.fab} onClick={openAdd}>Add</button>
      <footer className={styles.footer}>© 2026 D_MARA. All Rights Reserved.</footer>

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
        existingImage={existingUserImage} 
      />
    </div>
  );
}