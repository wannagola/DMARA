import {
  createContext,
  useState,
  useMemo,
  useEffect,
  useContext,
  ReactNode,
} from "react";

// 기본 테마 색상 정의
const DEFAULT_THEME_COLOR = "#883376";

type Theme = {
  themeColor: string;
  setThemeColor: (color: string) => void;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColor] = useState<string>(() => {
    // 로컬 스토리지에서 값 불러오기, 없으면 기본값 사용
    return localStorage.getItem("themeColor") || DEFAULT_THEME_COLOR;
  });

  useEffect(() => {
    // 테마가 변경될 때마다 로컬 스토리지에 저장
    localStorage.setItem("themeColor", themeColor);

    // CSS 변수 업데이트
    const root = document.documentElement;
    const primary = themeColor;
    root.style.setProperty("--primary-color", primary);
    
    // 16진수 색상 코드가 아닐 경우(예: 'red')를 대비한 예외처리
    if (!primary.startsWith("#")) {
        // 간단한 색상 이름에 대한 처리는 라이브러리 없이는 복잡하므로,
        // 여기서는 # 아닌 값은 RGBA 변환을 생략합니다.
        // 실제 프로덕션에서는 라이브러리를 사용하거나 더 정교한 변환이 필요합니다.
        return;
    }

    // RGBA 색상도 변수로 만들어주기
    const r = parseInt(primary.slice(1, 3), 16);
    const g = parseInt(primary.slice(3, 5), 16);
    const b = parseInt(primary.slice(5, 7), 16);

    root.style.setProperty("--primary-color-a90", `rgba(${r}, ${g}, ${b}, 0.9)`);
    root.style.setProperty("--primary-color-a75", `rgba(${r}, ${g}, ${b}, 0.75)`);
    root.style.setProperty("--primary-color-a55", `rgba(${r}, ${g}, ${b}, 0.55)`);
    root.style.setProperty("--primary-color-a50", `rgba(${r}, ${g}, ${b}, 0.5)`);
    root.style.setProperty("--primary-color-a45", `rgba(${r}, ${g}, ${b}, 0.45)`);
    root.style.setProperty("--primary-color-a40", `rgba(${r}, ${g}, ${b}, 0.4)`);
    root.style.setProperty("--primary-color-a35", `rgba(${r}, ${g}, ${b}, 0.35)`);
    root.style.setProperty("--primary-color-a30", `rgba(${r}, ${g}, ${b}, 0.3)`);
    root.style.setProperty("--primary-color-a20", `rgba(${r}, ${g}, ${b}, 0.2)`);
    root.style.setProperty("--primary-color-a18", `rgba(${r}, ${g}, ${b}, 0.18)`);

  }, [themeColor]);

  const value = useMemo(
    () => ({
      themeColor,
      setThemeColor,
    }),
    [themeColor]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
