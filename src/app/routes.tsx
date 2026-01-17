import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "@/pages/LoginPage/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage/OnboardingPage";
import WhoAmIPage from "@/pages/WhoAmIPage/WhoAmIPage";
import WhoAmIEditPage from "@/pages/WhoAmIEditPage/WhoAmIEditPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/whoami/edit", element: <WhoAmIEditPage /> },
  { path: "/whoami", element: <WhoAmIPage /> },
]);
