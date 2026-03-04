import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  legendId: string | null;
  role: "admin" | "user" | null;
  gameName: string | null;
  isLoggedIn: boolean;
  login: (legendId: string, role: string, gameName?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      legendId: null,
      role: null,
      gameName: null,
      isLoggedIn: false,
      login: (legendId: string, role: string, gameName?: string) =>
        set({
          legendId,
          role: role === "admin" ? "admin" : "user",
          gameName: gameName ?? null,
          isLoggedIn: true,
        }),
      logout: () =>
        set({
          legendId: null,
          role: null,
          gameName: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "lxa_session",
    },
  ),
);
