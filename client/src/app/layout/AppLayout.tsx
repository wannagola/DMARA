import { Outlet } from "react-router-dom";
import Header from "@/shared/components/Header/Header";
import { ProfileProvider } from "@/shared/context/ProfileContext.tsx";
import { ThemeProvider } from "@/shared/context/ThemeContext.tsx";

export default function AppLayout() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <Header />
        <Outlet />
      </ProfileProvider>
    </ThemeProvider>
  );
}
