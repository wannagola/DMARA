import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/pages/CalendarPage/CalendarPage.css";
import { isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";

// Copied from CommentPage.tsx for now
export type CommentItem = {
  id: number;
  category: string;
  title: string;
  date: string;
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
// --- End of copied data

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// A simple component to render a comment item, inspired by CommentPage
function CommentCard({ item }: { item: CommentItem }) {
  const navigate = useNavigate(); // Hook for navigation
  return (
    <article className="comment-card" onClick={() => navigate(`/comment/${item.id}`)}>
      <img className="comment-poster" src={item.imageUrl} alt={item.title} />
      <div className="comment-content">
        <div className="comment-top-row">
          <div className="comment-meta">
            <div className="comment-category">{item.category}</div>
            <div className="comment-title">{item.title}</div>
            <div className="comment-date">{item.date}</div>
          </div>
        </div>
        <p className="comment-preview">{item.contentPreview}</p>
      </div>
      <div className="comment-like-box">
        <div className="comment-heart" aria-hidden="true" />
        <div className="comment-like-count">{item.likes}</div>
      </div>
    </article>
  );
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = useMemo(() => {
    return initialItems.map((item) => ({
      title: item.title,
      start: new Date(item.date.replace(/\./g, "-")),
      end: new Date(item.date.replace(/\./g, "-")),
      resource: item,
    }));
  }, []);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return initialItems.filter((item) =>
      isSameDay(new Date(item.date.replace(/\./g, "-")), selectedDate),
    );
  }, [selectedDate]);

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
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
          selectable
          onSelectSlot={handleSelectSlot}
          dayPropGetter={(date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            return {
              className: isSelected ? "rbc-day-selected" : "",
            };
          }}
        />
      </div>

      <div className="comment-list-container">
        {selectedDayItems.length > 0 ? (
          selectedDayItems.map((item) => (
            <CommentCard key={item.id} item={item} />
          ))
        ) : (
          <div className="no-comments-message">
            <p>
              {selectedDate
                ? "작성된 코멘트가 없습니다."
                : "날짜를 선택하여 코멘트를 확인하세요."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
