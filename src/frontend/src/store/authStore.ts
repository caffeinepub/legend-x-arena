import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  legendId: string | null;
  role: "admin" | "user" | null;
  gameName: string | null;
  passwordHash: string | null;
  isLoggedIn: boolean;
  login: (
    legendId: string,
    role: string,
    gameName?: string,
    passwordHash?: string,
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      legendId: null,
      role: null,
      gameName: null,
      passwordHash: null,
      isLoggedIn: false,
      login: (
        legendId: string,
        role: string,
        gameName?: string,
        passwordHash?: string,
      ) =>
        set({
          legendId,
          role: role === "admin" ? "admin" : "user",
          gameName: gameName ?? null,
          passwordHash: passwordHash ?? null,
          isLoggedIn: true,
        }),
      logout: () =>
        set({
          legendId: null,
          role: null,
          gameName: null,
          passwordHash: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "lxa_session",
    },
  ),
);
