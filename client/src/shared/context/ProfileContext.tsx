import { createContext, useState, type ReactNode } from "react";
import type { CategoryItem } from "@/shared/types/category";
import type { CategoryKey } from "@/shared/constants/categories";
import type { LibraryItem } from "@/shared/components/ItemAutocompleteSearch/ItemAutocompleteSearch.tsx";

// --- Data Types ---
export interface ProfileState {
  username: string;
  iam: string;
  musicItems: CategoryItem[];
  movieItems: CategoryItem[];
  talentItems: CategoryItem[];
  sportsItems: CategoryItem[];
  matchesItems: CategoryItem[];
  dramaItems: CategoryItem[];
  showsItems: CategoryItem[];
}

export interface ProfileContextValue extends ProfileState {
  setUsername: (username: string) => void;
  setIam: (iam: string) => void;
  getItemsByCategory: (category: CategoryKey) => CategoryItem[];
  addItemToCategory: (category: CategoryKey, item: LibraryItem) => void;
  removeItemFromCategory: (category: CategoryKey, id: number) => void;
}

// --- Initial State & Mock Data ---
// In a real app, this would be empty and loaded via API
const initialMusicItems: CategoryItem[] = [
  {
    id: 1,
    title: "Dance All Night",
    subtitle: "Rose - BlackPink",
    imageUrl: new URL(`/src/assets/items/music1.jpeg`, import.meta.url).href,
  },
  {
    id: 2,
    title: "Love Never Felt So Good",
    subtitle: "Michael Jackson",
    imageUrl: new URL(`/src/assets/items/music2.jpeg`, import.meta.url).href,
  },
];

// --- Context Definition ---
export const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

// --- Provider Component ---
type ProfileProviderProps = {
  children: ReactNode;
};

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [username, setUsername] = useState("Sungm1nk1");
  const [iam, setIam] = useState("");
  const [musicItems, setMusicItems] = useState<CategoryItem[]>(initialMusicItems);
  const [movieItems, setMovieItems] = useState<CategoryItem[]>([]);
  const [talentItems, setTalentItems] = useState<CategoryItem[]>([]);
  const [sportsItems, setSportsItems] = useState<CategoryItem[]>([]);
  const [matchesItems, setMatchesItems] = useState<CategoryItem[]>([]);
  const [dramaItems, setDramaItems] = useState<CategoryItem[]>([]);
  const [showsItems, setShowsItems] = useState<CategoryItem[]>([]);

  const getItemsByCategory = (category: CategoryKey): CategoryItem[] => {
    switch (category) {
      case "Music": return musicItems;
      case "Movie": return movieItems;
      case "Talent": return talentItems;
      case "Sports": return sportsItems;
      case "Matches": return matchesItems;
      case "Drama & OTT": return dramaItems;
      case "Shows": return showsItems;
      default: return [];
    }
  };

  const removeItemFromCategory = (category: CategoryKey, id: number) => {
    const updater = (prev: CategoryItem[]) => prev.filter((it) => it.id !== id);
    switch (category) {
      case "Music": setMusicItems(updater); break;
      case "Movie": setMovieItems(updater); break;
      case "Talent": setTalentItems(updater); break;
      case "Sports": setSportsItems(updater); break;
      case "Matches": setMatchesItems(updater); break;
      case "Drama & OTT": setDramaItems(updater); break;
      case "Shows": setShowsItems(updater); break;
    }
  };

  const addItemToCategory = (category: CategoryKey, item: LibraryItem) => {
    const newItem: CategoryItem = {
      id: item.id,
      title: item.title,
      subtitle: item.category,
      imageUrl: item.imageUrl,
    };
    const updater = (prev: CategoryItem[]) => {
      if (prev.some((existing) => existing.id === newItem.id)) return prev;
      return [...prev, newItem];
    };
    switch (category) {
        case "Music": setMusicItems(updater); break;
        case "Movie": setMovieItems(updater); break;
        case "Talent": setTalentItems(updater); break;
        case "Sports": setSportsItems(updater); break;
        case "Matches": setMatchesItems(updater); break;
        case "Drama & OTT": setDramaItems(updater); break;
        case "Shows": setShowsItems(updater); break;
    }
  };

  const value: ProfileContextValue = {
    username,
    iam,
    musicItems,
    movieItems,
    talentItems,
    sportsItems,
    matchesItems,
    dramaItems,
    showsItems,
    setUsername,
    setIam,
    getItemsByCategory,
    addItemToCategory,
    removeItemFromCategory,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
