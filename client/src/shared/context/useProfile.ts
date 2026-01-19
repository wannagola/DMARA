import { useContext } from "react";
import {
  ProfileContext,
  type ProfileContextValue,
} from "./ProfileContext.tsx";

export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
