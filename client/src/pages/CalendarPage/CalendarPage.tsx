import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, NavigateAction } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/pages/CalendarPage/CalendarPage.css";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "@/config";

// 데이터 타입 정의
export type CommentItem = {
  id: number;
  category: string;
  title: string;
  date: string;
  dateObj: Date;
  contentPreview: string;
  posterUrl: string;
  likes: number;
  isLiked: boolean;
  isOwner: boolean;
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// 카드 컴포넌트
function CommentCard({ item, onLikeToggle }: { item: CommentItem; onLikeToggle: (e: React.MouseEvent, id: number) => void }) {
  const navigate = useNavigate();

  return (
    <article className="comment-card" onClick={() => navigate(`/comment/${item.id}`)}>
      <img 
        className="comment-poster" 
        src={item.posterUrl || "/src/assets/items/placeholder.png"} 
        alt={item.title} 
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <div className="comment-content">
        <div className="comment-category">{item.category}</div>
        <div className="comment-title">{item.title}</div>
        <div className="comment-date">{item.date}</div>
        <p className="comment-preview">{item.contentPreview}</p>
      </div>
      
      <div className="comment-like-box" onClick={(e) => onLikeToggle(e, item.id)}>
        <button className="comment-heart-btn" type="button">
          <svg
            className={`comment-heart-svg ${item.isLiked ? 'liked' : ''}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        <div className="comment-like-count">{item.likes}</div>
      </div>
    </article>
  );
}

export default function CalendarPage() {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
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
            dateObj: new Date(it.date),
            contentPreview: it.content,
            posterUrl: it.poster_url || "",
            likes: it.likes_count || 0,
            isLiked: it.is_liked,
            isOwner: it.is_owner,
          }));

          // ✅ [핵심 수정] 내 글(isOwner === true)만 필터링하여 저장
          const myItems = loadedItems.filter((item: any) => item.isOwner);
          setItems(myItems);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPosts();
  }, []);

  const events = useMemo(() => {
    return items.map((item) => ({
      title: item.title,
      start: item.dateObj,
      end: item.dateObj,
      resource: item,
    }));
  }, [items]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return items.filter((item) => isSameDay(item.dateObj, selectedDate));
  }, [selectedDate, items]);

  const handleNavigate = (newDate: Date, view: any, action: NavigateAction) => {
    setCurrentDate(newDate);
  };

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
  };
  
  const handleSelectEvent = (event: any) => {
    setSelectedDate(event.start);
  };

  const handleLikeToggle = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setItems((prev) =>
        prev.map((it) => {
            if (it.id === id) {
                const newIsLiked = !it.isLiked;
                return { ...it, isLiked: newIsLiked, likes: it.likes + (newIsLiked ? 1 : -1) };
            }
            return it;
        })
    );
    const token = localStorage.getItem("userToken");
    if (token) {
        try {
            await fetch(`${BACKEND_URL}/api/posts/${id}/like/`, {
                method: "POST",
                headers: { Authorization: `Token ${token}` }
            });
        } catch(err) { console.error(err); }
    }
  };

  return (
    <div className="calendar-page-container">
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH]}
          date={currentDate}
          onNavigate={handleNavigate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          dayPropGetter={(date) => ({
            className: selectedDate && isSameDay(date, selectedDate) ? "rbc-day-selected" : "",
          })}
        />
      </div>

      <div className="comment-list-container">
        {selectedDayItems.length > 0 ? (
          selectedDayItems.map((item) => (
            <CommentCard key={item.id} item={item} onLikeToggle={handleLikeToggle} />
          ))
        ) : (
          <div className="no-comments-message">
            <p>{selectedDate ? "작성된 코멘트가 없습니다." : "날짜를 선택하여 코멘트를 확인하세요."}</p>
          </div>
        )}
      </div>
    </div>
  );
}