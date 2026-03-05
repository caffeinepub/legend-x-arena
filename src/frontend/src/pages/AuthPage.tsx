import { Role } from "@/backend.d";
import { FireAnimation } from "@/components/FireAnimation";
import { useActor } from "@/hooks/useActor";
import { hashPassword } from "@/lib/crypto";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type LoginFormValues = {
  legendId: string;
  password: string;
};

type RegisterFormValues = {
  password: string;
  gameName: string;
  gameUID: string;
  jazzCashNumber: string;
};

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedId, setAssignedId] = useState<string | null>(null);
  const [pendingNav, setPendingNav] = useState(false);
  const [nextLegendId, setNextLegendId] = useState<string | null>(null);
  const registerBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { actor } = useActor();
  const login = useAuthStore((s) => s.login);

  // Fetch next Legend ID when register tab is active
  useEffect(() => {
    if (activeTab !== "register" || !actor) return;
    let cancelled = false;
    actor
      .getNextLegendId()
      .then((id) => {
        if (!cancelled) setNextLegendId(id);
      })
      .catch(() => {
        /* silently ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, actor]);

  const loginForm = useForm<LoginFormValues>();
  const registerForm = useForm<RegisterFormValues>();

  // Auto-navigate after 4s once Legend ID is shown
  useEffect(() => {
    if (!assignedId || !pendingNav) return;
    const timer = setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 4000);
    return () => clearTimeout(timer);
  }, [assignedId, pendingNav, navigate]);

  async function handleLogin(data: LoginFormValues) {
    if (!actor) {
      toast.error("Backend not ready. Please wait…");
      return;
    }
    setIsSubmitting(true);
    try {
      const hash = await hashPassword(data.password);
      const ok = await actor.authenticate(data.legendId.trim(), hash);
      if (!ok) {
        toast.error("Invalid Legend ID or password.");
        return;
      }
      const profile = await actor.getUserByLegendId(data.legendId.trim());
      if (profile.isBanned) {
        toast.error("This account has been banned.");
        return;
      }
      const roleStr = profile.role === Role.admin ? "admin" : "user";
      login(profile.legendId, roleStr, profile.gameName, hash);
      toast.success("Welcome back, Commander!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(data: RegisterFormValues) {
    if (!actor) {
      toast.error("Backend not ready. Please wait…");
      return;
    }
    // Fire explosion animation
    if (registerBtnRef.current) {
      registerBtnRef.current.classList.add("animate-fire-explosion");
      setTimeout(() => {
        registerBtnRef.current?.classList.remove("animate-fire-explosion");
      }, 600);
    }
    setIsSubmitting(true);
    try {
      const hash = await hashPassword(data.password);
      const assignedLegendId = await actor.register(
        hash,
        data.jazzCashNumber.trim(),
        data.gameUID.trim(),
        data.gameName.trim(),
      );
      // After register, authenticate and get profile using the assigned Legend ID
      const ok = await actor.authenticate(assignedLegendId, hash);
      if (!ok) {
        toast.error("Registration error. Please try logging in.");
        return;
      }
      const profile = await actor.getUserByLegendId(assignedLegendId);
      const roleStr = profile.role === Role.admin ? "admin" : "user";
      login(profile.legendId, roleStr, profile.gameName, hash);
      // Show the assigned Legend ID to the user before navigating
      setAssignedId(assignedLegendId);
      setPendingNav(true);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      const userMsg =
        errMsg.includes("already") ||
        errMsg.includes("taken") ||
        errMsg.includes("registered")
          ? errMsg
              .replace(/^.*?Error:\s*/i, "")
              .replace(/\s*\(\s*at.*\).*$/s, "")
              .trim()
          : "Registration failed. Please try again.";
      toast.error(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0a0a0f" }}
    >
      <FireAnimation side="left" intensity="low" />
      <FireAnimation side="right" intensity="low" />

      {/* Background gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 60% at 20% 50%, rgba(255,34,0,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 50%, rgba(0,102,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl flex items-center justify-center gap-0">
            <span className="animate-legend-flame" style={{ color: "#ff2200" }}>
              LEGEND
            </span>
            <span
              className="animate-x-beat"
              style={{
                color: "#ffd700",
                fontSize: "1.3em",
                margin: "0 0.12em",
              }}
            >
              X
            </span>
            <span
              className="animate-arena-electric"
              style={{ color: "#0066ff" }}
            >
              ARENA
            </span>
          </h1>
          <p
            className="text-xs font-body uppercase tracking-[0.3em] mt-2"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Esports Tournament Platform
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(13, 13, 26, 0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Tabs */}
          <div className="flex">
            <button
              type="button"
              data-ocid="auth.login_tab"
              onClick={() => setActiveTab("login")}
              className="flex-1 py-4 font-display font-bold text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                background:
                  activeTab === "login"
                    ? "linear-gradient(180deg, rgba(255,34,0,0.15), transparent)"
                    : "transparent",
                color:
                  activeTab === "login" ? "#ff4422" : "rgba(255,255,255,0.4)",
                borderBottom:
                  activeTab === "login"
                    ? "2px solid #ff2200"
                    : "2px solid transparent",
              }}
            >
              Login
            </button>
            <button
              type="button"
              data-ocid="auth.register_tab"
              onClick={() => setActiveTab("register")}
              className="flex-1 py-4 font-display font-bold text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                background:
                  activeTab === "register"
                    ? "linear-gradient(180deg, rgba(0,102,255,0.15), transparent)"
                    : "transparent",
                color:
                  activeTab === "register"
                    ? "#4499ff"
                    : "rgba(255,255,255,0.4)",
                borderBottom:
                  activeTab === "register"
                    ? "2px solid #0066ff"
                    : "2px solid transparent",
              }}
            >
              Register
            </button>
          </div>

          {/* Forms container with sliding animation */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{
                transform: `translateX(${activeTab === "login" ? "0" : "-50%"})`,
                width: "200%",
              }}
            >
              {/* ── LOGIN FORM ── */}
              <div className="w-1/2 p-8">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} noValidate>
                  <div className="space-y-5">
                    <div>
                      <label
                        className="block text-xs font-body uppercase tracking-wider mb-2"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                        htmlFor="login-legend-id"
                      >
                        Legend ID
                      </label>
                      <input
                        id="login-legend-id"
                        data-ocid="auth.legend_id_input"
                        className="input-fire-red w-full px-4 py-3 rounded-lg font-body text-sm text-foreground transition-all duration-200"
                        placeholder="Enter your Legend ID"
                        autoComplete="username"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,34,0,0.25)",
                          outline: "none",
                        }}
                        {...loginForm.register("legendId", {
                          required: "Legend ID is required",
                          minLength: { value: 3, message: "Min 3 characters" },
                        })}
                      />
                      {loginForm.formState.errors.legendId && (
                        <p
                          data-ocid="auth.error_state"
                          className="text-xs mt-1.5 font-body"
                          style={{ color: "#ff4422" }}
                        >
                          {loginForm.formState.errors.legendId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-xs font-body uppercase tracking-wider mb-2"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                        htmlFor="login-password"
                      >
                        Password
                      </label>
                      <input
                        id="login-password"
                        data-ocid="auth.password_input"
                        type="password"
                        className="input-fire-red w-full px-4 py-3 rounded-lg font-body text-sm text-foreground transition-all duration-200"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,34,0,0.25)",
                          outline: "none",
                        }}
                        {...loginForm.register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Min 6 characters" },
                        })}
                      />
                      {loginForm.formState.errors.password && (
                        <p
                          className="text-xs mt-1.5 font-body"
                          style={{ color: "#ff4422" }}
                        >
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      data-ocid="auth.submit_button"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #cc1100, #ff4400)",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(255,34,0,0.3)",
                      }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Authenticating…
                        </span>
                      ) : (
                        "ENTER ARENA"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* ── REGISTER FORM ── */}
              <div className="w-1/2 p-8">
                {assignedId ? (
                  /* ── LEGEND ID REVEAL ── */
                  <div className="flex flex-col items-center justify-center gap-5 py-4">
                    <div className="text-center">
                      <p
                        className="text-xs font-body uppercase tracking-[0.3em] mb-4"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        Registration Successful!
                      </p>
                      <p
                        className="font-display font-black text-sm uppercase tracking-wider mb-3"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        Your Legend ID is:
                      </p>
                      {/* Big glowing red Legend ID */}
                      <div
                        className="inline-block px-6 py-4 rounded-2xl mb-4"
                        style={{
                          background: "rgba(255,34,0,0.08)",
                          border: "2px solid rgba(255,34,0,0.6)",
                          boxShadow:
                            "0 0 24px rgba(255,34,0,0.4), 0 0 60px rgba(255,34,0,0.15), inset 0 0 24px rgba(255,34,0,0.05)",
                          animation: "legendIdGlow 2s ease-in-out infinite",
                        }}
                      >
                        <span
                          className="font-display font-black text-4xl tabular-nums tracking-[0.3em]"
                          style={{
                            color: "#ff2200",
                            textShadow:
                              "0 0 20px rgba(255,34,0,0.9), 0 0 40px rgba(255,34,0,0.5)",
                          }}
                        >
                          {assignedId}
                        </span>
                      </div>
                      <p
                        className="text-xs font-body text-center mb-5"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        Save this ID — you need it to login!
                        <br />
                        <span style={{ color: "rgba(255,215,0,0.6)" }}>
                          Entering arena automatically…
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      data-ocid="auth.enter_arena_button"
                      onClick={() => navigate({ to: "/dashboard" })}
                      className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #cc1100, #ff4400)",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(255,34,0,0.3)",
                      }}
                    >
                      ENTER ARENA
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    noValidate
                  >
                    <div className="space-y-5">
                      {/* Auto-assigned Legend ID info banner */}
                      <div
                        className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs font-body"
                        style={{
                          background: "rgba(0,153,255,0.08)",
                          border: "1px solid rgba(0,153,255,0.25)",
                          color: "#4499ff",
                        }}
                      >
                        <span className="mt-0.5 flex-shrink-0">🪪</span>
                        <div className="flex flex-col gap-1">
                          <span>
                            Your unique Legend ID will be assigned automatically
                            when you join.
                          </span>
                          {nextLegendId && (
                            <span className="flex items-center gap-2 mt-0.5">
                              <span style={{ color: "rgba(100,180,255,0.8)" }}>
                                Your Legend ID will be:
                              </span>
                              <span
                                className="font-display font-black text-sm tracking-widest"
                                style={{
                                  color: "#ff2200",
                                  textShadow:
                                    "0 0 8px rgba(255,34,0,0.9), 0 0 16px rgba(255,34,0,0.5), 0 0 24px rgba(255,34,0,0.3)",
                                }}
                              >
                                {nextLegendId}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-xs font-body uppercase tracking-wider mb-2"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                          htmlFor="register-password"
                        >
                          Set Password
                        </label>
                        <input
                          id="register-password"
                          type="password"
                          className="input-fire-blue w-full px-4 py-3 rounded-lg font-body text-sm text-foreground transition-all duration-200"
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(0,102,255,0.25)",
                            outline: "none",
                          }}
                          {...registerForm.register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 6,
                              message: "Min 6 characters",
                            },
                          })}
                        />
                        {registerForm.formState.errors.password && (
                          <p
                            className="text-xs mt-1.5 font-body"
                            style={{ color: "#ff4422" }}
                          >
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Game Name */}
                      <div>
                        <label
                          className="block text-xs font-body uppercase tracking-wider mb-2"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                          htmlFor="register-game-name"
                        >
                          Free Fire Name
                        </label>
                        <input
                          id="register-game-name"
                          data-ocid="auth.game_name_input"
                          type="text"
                          className="input-fire-blue w-full px-4 py-3 rounded-lg font-body text-sm text-foreground transition-all duration-200"
                          placeholder="Enter your Free Fire name"
                          autoComplete="off"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(0,102,255,0.25)",
                            outline: "none",
                          }}
                          {...registerForm.register("gameName", {
                            required: "Free Fire name is required",
                            minLength: {
                              value: 2,
                              message: "Min 2 characters",
                            },
                          })}
                        />
                        {registerForm.formState.errors.gameName && (
                          <p
                            className="text-xs mt-1.5 font-body"
                            style={{ color: "#ff4422" }}
                          >
                            {registerForm.formState.errors.gameName.message}
                          </p>
                        )}
                      </div>

                      {/* Game UID */}
                      <div>
                        <label
                          className="block text-xs font-body uppercase tracking-wider mb-2"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                          htmlFor="register-game-uid"
                        >
                          Free Fire UID
                        </label>
                        <input
                          id="register-game-uid"
                          data-ocid="auth.game_uid_input"
                          type="text"
                          className="input-fire-blue w-full px-4 py-3 rounded-lg font-body text-sm text-foreground transition-all duration-200"
                          placeholder="Enter your Free Fire UID"
                          autoComplete="off"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(0,102,255,0.25)",
                            outline: "none",
                          }}
                          {...registerForm.register("gameUID", {
                            required: "Free Fire UID is required",
                            minLength: {
                              value: 4,
                              message: "Min 4 characters",
                            },
                          })}
                        />
                        {registerForm.formState.errors.gameUID && (
                          <p
                            className="text-xs mt-1.5 font-body"
                            style={{ color: "#ff4422" }}
                          >
                            {registerForm.formState.errors.gameUID.message}
                          </p>
                        )}
                      </div>

                      {/* JazzCash Number */}
                      <div>
                        <label
                          className="block text-xs font-body uppercase tracking-wider mb-2"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                          htmlFor="register-jazzcash"
                        >
                          JazzCash Number
                        </label>
                        <input
                          id="register-jazzcash"
                          data-ocid="auth.jazzcash_input"
                          type="tel"
                          className="input-fire-blue w-full px-4 py-3 rounded-lg font-body text-sm text-foreground transition-all duration-200"
                          placeholder="Enter your JazzCash number"
                          autoComplete="tel"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(0,102,255,0.25)",
                            outline: "none",
                          }}
                          {...registerForm.register("jazzCashNumber", {
                            required: "JazzCash number is required",
                            minLength: {
                              value: 10,
                              message: "Enter a valid JazzCash number",
                            },
                          })}
                        />
                        {registerForm.formState.errors.jazzCashNumber && (
                          <p
                            className="text-xs mt-1.5 font-body"
                            style={{ color: "#ff4422" }}
                          >
                            {
                              registerForm.formState.errors.jazzCashNumber
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <button
                        ref={registerBtnRef}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #0044cc, #0099ff)",
                          color: "#fff",
                          boxShadow: "0 0 20px rgba(0,102,255,0.3)",
                        }}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating Account…
                          </span>
                        ) : (
                          "JOIN THE ARENA"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs font-body uppercase tracking-wider transition-colors hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            ← Back to Arena
          </a>
        </div>
      </div>
    </div>
  );
}
