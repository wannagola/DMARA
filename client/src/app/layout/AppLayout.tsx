import { Outlet } from "react-router-dom";
import Header from "@/shared/components/Header/Header";
import { ProfileProvider } from "@/shared/context/ProfileContext.tsx";

export default function AppLayout() {
  return (
    <ProfileProvider>
      <Header />
      <Outlet />
    </ProfileProvider>
  );
}
