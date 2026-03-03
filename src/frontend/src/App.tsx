import { Toaster } from "@/components/ui/sonner";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LandingPage } from "@/pages/LandingPage";
import { useAuthStore } from "@/store/authStore";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#0d0d1a",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f2f2f8",
            fontFamily: '"Outfit", sans-serif',
          },
        }}
      />
    </>
  ),
});

// Landing page route
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

// Auth route — redirect to dashboard if already logged in
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  beforeLoad: () => {
    const { isLoggedIn } = useAuthStore.getState();
    if (isLoggedIn) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthPage,
});

// Dashboard route — protected
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    const { isLoggedIn } = useAuthStore.getState();
    if (!isLoggedIn) {
      throw redirect({ to: "/auth" });
    }
  },
  component: DashboardPage,
});

// Admin route — admin only
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    const { isLoggedIn, role } = useAuthStore.getState();
    if (!isLoggedIn) {
      throw redirect({ to: "/auth" });
    }
    if (role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  authRoute,
  dashboardRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
