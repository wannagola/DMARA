import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/app/layout/AppLayout";
import LoginPage from "@/pages/LoginPage/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage/OnboardingPage";
import WhoAmIPage from "@/pages/WhoAmIPage/WhoAmIPage";
import WhoAmIEditPage from "@/pages/WhoAmIEditPage/WhoAmIEditPage";
import CommentPage from "@/pages/CommentPage/CommentPage";
import CalendarPage from "@/pages/CalendarPage/CalendarPage";
import CommentDetailPage from "@/pages/CommentDetailPage/CommentDetailPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/login", element: <LoginPage /> },

  {
    element: <AppLayout />,
    children: [
      { path: "/onboarding", element: <OnboardingPage /> },
      { path: "/whoami", element: <WhoAmIPage /> },
      { path: "/whoami/edit", element: <WhoAmIEditPage /> },
      { path: "/comment", element: <CommentPage /> },
      { path: "/comment/:commentId", element: <CommentDetailPage /> },
      { path: "/calendar", element: <CalendarPage /> },
    ],
  },
]);
