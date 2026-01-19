import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CommentDetailPage.module.css";
import type { CommentItem } from "@/pages/CommentPage/CommentPage.tsx";

// Copied from CommentPage.tsx for now
const initialItems: CommentItem[] = [
  {
    id: 1,
    category: "Exhibitions & Shows",
    title: "Wicked",
    date: "2026.01.16",
    contentPreview:
      "오늘 뮤지컬 Wicked를 보고 왔다. 생각보다 내용이 무거워서 조금 놀랐다. 엘파바가 단순히 나쁜 마녀가 아니라는 사실에 충격받았고, 오히려 그녀의 신념과 우정이 빛나는 모습이 인상 깊었다. 글린다와의 케미도 최고! 마지막 장면에서는 나도 모르게 눈물이 났다. 무대 연출과 의상, 넘버까지 모든 것이 완벽했던 공연.",
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
// ---

export default function CommentDetailPage() {
  const { commentId } = useParams<{ commentId: string }>();
  const navigate = useNavigate();
  const [comment, setComment] = useState<CommentItem | null>(null);

  // State for interactive likes
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const foundComment = initialItems.find(
      (item) => item.id === Number(commentId),
    );
    setComment(foundComment || null);
    // Initialize like state when comment is loaded
    if (foundComment) {
      setLikeCount(foundComment.likes);
      setIsLiked(false); // In a real app, you'd check if the user already liked this
    }
  }, [commentId]);

  const handleLikeClick = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  if (!comment) {
    return <div className={styles.loading}>Comment not found.</div>;
  }

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
          <p className={styles.category}>{comment.category}</p>
          <h1 className={styles.title}>{comment.title}</h1>
          <div className={styles.meta}>
            <span className={styles.date}>{comment.date}</span>
            <div className={styles.likeBox}>
              <button
                className={styles.heartButton}
                onClick={handleLikeClick}
                aria-label="Like"
              >
                <svg
                  className={`${styles.heart} ${isLiked ? styles.liked : ""}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <span className={styles.likeCount}>{likeCount}</span>
            </div>
          </div>
        </header>

        <img
          className={styles.poster}
          src={comment.imageUrl}
          alt={comment.title}
        />

        <div className={styles.contentBody}>
          <p>{comment.contentPreview}</p>
        </div>
      </article>
    </div>
  );
}
