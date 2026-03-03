import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  legendId: string | null;
  role: "admin" | "user" | null;
  isLoggedIn: boolean;
  login: (legendId: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      legendId: null,
      role: null,
      isLoggedIn: false,
      login: (legendId: string, role: string) =>
        set({
          legendId,
          role: role === "admin" ? "admin" : "user",
          isLoggedIn: true,
        }),
      logout: () =>
        set({
          legendId: null,
          role: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "lxa_session",
    },
  ),
);
