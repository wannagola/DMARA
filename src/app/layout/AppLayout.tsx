import { Outlet } from "react-router-dom";
import Header from "@/shared/components/Header/Header";

export default function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
