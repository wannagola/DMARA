import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CommentDetailPage.module.css";
import BACKEND_URL from "@/config";

// 데이터 타입 정의
type PostDetail = {
  id: number;
  category: string;
  title: string;
  date: string;
  content: string;
  posterUrl: string;
  userImageUrl: string | null;
  likes: number;
  isLiked: boolean; // ✅ 서버에서 받아올 핵심 데이터
};

export default function CommentDetailPage() {
  const { commentId } = useParams<{ commentId: string }>(); // URL이 /comment/:commentId 라고 가정
  // 만약 URL이 /comment/:id 라면 useParams<{ id: string }>() 사용
  
  const detailId = commentId; // 혹은 params.id

  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. 상세 데이터 불러오기 (GET)
  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("userToken");
      if (!detailId || !token) return;

      try {
        const res = await fetch(`${BACKEND_URL}/api/posts/${detailId}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // 백엔드 데이터 매핑
          setPost({
            id: data.id,
            category: data.category,
            title: data.title,
            date: data.date_str || data.date,
            content: data.content,
            posterUrl: data.poster_url || "",
            userImageUrl: data.user_image || null,
            likes: data.likes_count || 0,
            isLiked: data.is_liked, // ✅ 백엔드가 보내주는 좋아요 상태
          });
        } else {
          console.error("Failed to load post");
          navigate(-1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [detailId, navigate]);

  // 2. 좋아요 기능
  const handleLikeClick = async () => {
    if (!post) return;
    
    // UI 즉시 업데이트
    const newIsLiked = !post.isLiked;
    setPost(prev => prev ? ({
        ...prev,
        isLiked: newIsLiked,
        likes: prev.likes + (newIsLiked ? 1 : -1)
    }) : null);

    // 서버 요청
    const token = localStorage.getItem("userToken");
    if(token) {
        try {
            await fetch(`${BACKEND_URL}/api/posts/${post.id}/like/`, {
                method: "POST",
                headers: { Authorization: `Token ${token}` }
            });
        } catch(e) { console.error(e); }
    }
  };

  if (loading) return <div style={{ color: "white", padding: "50px", textAlign: "center" }}>Loading...</div>;
  if (!post) return null;

  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ‹
        </button>

        <header className={styles.header}>
          <p className={styles.category}>{post.category}</p>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <span className={styles.date}>{post.date}</span>
            <div className={styles.likeBox}>
              <button
                className={styles.heartButton}
                onClick={handleLikeClick}
                aria-label="Like"
              >
                <svg
                  className={`${styles.heart} ${post.isLiked ? styles.liked : ""}`} // ✅ isLiked 상태에 따라 색상 변경
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <span className={styles.likeCount}>{post.likes}</span>
            </div>
          </div>
        </header>

        {/* 포스터 이미지 */}
        {post.posterUrl && (
          <div style={{ display: "flex", justifyContent: "center", margin: "30px 0" }}>
            <img
              className={styles.poster}
              src={post.posterUrl}
              alt={post.title}
              style={{
                width: "300px", height: "300px", objectFit: "cover",
                borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}
            />
          </div>
        )}

        {/* 유저 직찍 이미지 */}
        {post.userImageUrl && (
           <div style={{ marginTop: "20px", marginBottom: "20px", borderRadius: "12px", overflow: "hidden" }}>
             <img src={post.userImageUrl} alt="User upload" style={{ width: "100%", height: "auto", display: "block" }} />
           </div>
        )}

        <div className={styles.contentBody}>
          <p>{post.content}</p>
        </div>
      </article>
    </div>
  );
}