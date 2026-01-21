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
};

// ✅ [추가] 프론트엔드 카테고리 -> 백엔드 코드로 변환하는 지도
const TO_BACKEND_CATEGORY: Record<string, string> = {
  "Exhibitions & Shows": "SHOW",
  "Movie": "MOVIE",
  "Music": "MUSIC",
  "Sports": "SPORTS",
  "Talent": "ACTOR",
  "Matches": "MATCH",
  "TV": "DRAMA",
  "Shows": "SHOW", // Shows도 전시/공연으로 처리
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
  const [category, setCategory] = useState("Exhibitions & Shows");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // --- 1. DB에서 코멘트 목록 불러오기 ---
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
            // 백엔드 코드(EXHIBITION)가 오면 그냥 보여주거나, 필요하면 다시 한글로 변환 가능
            category: it.category, 
            title: it.title,
            date: it.date_str || it.date,
            contentPreview: it.content,
            posterUrl: it.poster_url || "",
            userImageUrl: it.user_image || null,
            likes: it.likes_count || 0,
            isOwner: it.is_owner,
          }));
          setItems(loadedItems);
        }
      } catch (e) {
        console.error("Failed to load comments:", e);
      }
    };
    fetchComments();
  }, []);

  // --- 2. 탭 필터링 ---
  const visibleItems = useMemo(() => {
    if (tab === "MY") {
      return items.filter((it) => it.isOwner);
    } else {
      return items.filter((it) => !it.isOwner);
    }
  }, [items, tab]);

  const handleLikeToggle = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    // UI 즉시 반영 (Optimistic Update)
    const isLiked = likedIds.has(id);
    const newLikedIds = new Set(likedIds);
    if (isLiked) newLikedIds.delete(id);
    else newLikedIds.add(id);
    setLikedIds(newLikedIds);
    
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, likes: it.likes + (isLiked ? -1 : 1) } : it
      )
    );

    // 서버에 좋아요 요청 전송
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
    } catch(e) {
        console.error(e);
    }
    setMenuOpenId(null);
  };

  const openAdd = () => {
    setMenuOpenId(null);
    setCategory("Exhibitions & Shows");
    setTitle("");
    setDate(null);
    setComment("");
    setFile(null);
    setIsAddOpen(true);
  };

  const closeAdd = () => setIsAddOpen(false);

  // --- 3. 코멘트 업로드 ---
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

    // ✅ [핵심 수정] 카테고리 변환 (Exhibitions & Shows -> EXHIBITION)
    // 매핑에 없으면 기본값 ETC
    const backendCategory = TO_BACKEND_CATEGORY[payload.category] || "ETC";

    const formData = new FormData();
    formData.append("category", backendCategory); // 변환된 값 전송
    formData.append("title", payload.title);
    formData.append("date", dateStr);
    formData.append("content", payload.comment);
    
    // ✅ [안전 장치] 빈 문자열("")이면 보내지 않음 (URLField 에러 방지)
    if (payload.posterUrl) {
        formData.append("poster_url", payload.posterUrl);
    }
    
    if (payload.file) {
        formData.append("user_image", payload.file);
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/posts/`, {
            method: "POST",
            headers: { Authorization: `Token ${token}` },
            body: formData,
        });

        if (res.ok) {
            const newServerItem = await res.json();
            const newItem: CommentItem = {
                id: newServerItem.id,
                category: newServerItem.category,
                title: newServerItem.title,
                date: newServerItem.date_str || dateStr.replace(/-/g, '.'),
                contentPreview: newServerItem.content,
                posterUrl: newServerItem.poster_url,
                userImageUrl: newServerItem.user_image,
                likes: 0,
                isOwner: true,
            };
            setItems((prev) => [newItem, ...prev]);
            closeAdd();
        } else {
            const errData = await res.json();
            console.error("Upload failed", errData);
            alert(`업로드 실패: ${JSON.stringify(errData)}`);
        }
    } catch (e) {
        console.error("Network error", e);
        alert("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.page}>
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
          className={`${styles.subTab} ${tab === "FRIENDS" ? styles.active : ""}`}
          onClick={() => setTab("FRIENDS")}
        >
          Friends
        </button>
      </div>

      <div className={styles.list}>
        {visibleItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            {tab === "MY" 
                ? "아직 작성한 코멘트가 없습니다." 
                : "친구들의 코멘트가 없습니다."}
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
              {/* 포스터 이미지 (없으면 숨김) */}
              <img
                className={styles.poster}
                src={it.posterUrl || "/src/assets/items/placeholder.png"}
                alt={it.title}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />

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
                      onClick={(e) => toggleMenu(e, it.id)}
                    >
                      •••
                    </button>
                    {menuOpenId === it.id && (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={(e) => deleteItem(e, it.id)}
                      >
                        DELETE
                      </button>
                    )}
                  </div>
                </div>

                {/* 유저가 올린 직찍 */}
                {it.userImageUrl && (
                  <div style={{ marginTop: "16px", marginBottom: "8px" }}>
                    <img
                      src={it.userImageUrl}
                      alt="User Upload"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        borderRadius: "12px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

                <p className={styles.preview}>{it.contentPreview}</p>
              </div>

              <div
                className={styles.likeBox}
                onClick={(e) => handleLikeToggle(e, it.id)}
              >
                <button className={styles.heartButton}>
                  <svg
                    className={`${styles.heart} ${isLiked ? styles.liked : ""}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <div className={styles.likeCount}>{it.likes}</div>
              </div>
            </article>
          );
        })}
      </div>

      <button type="button" className={styles.fab} onClick={openAdd}>
        Add
      </button>

      <footer className={styles.footer}>
        © 2026 D_MARA. All Rights Reserved.
      </footer>

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