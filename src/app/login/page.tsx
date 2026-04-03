"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#f8fafc" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-12 relative overflow-hidden flex-shrink-0"
        style={{ background: "#0a0f1e" }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-60px",
            left: "-60px",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 65%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 5h12M4 8h8M4 11h10M4 14h6"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span
            className="font-semibold tracking-tight"
            style={{ color: "#f1f5f9" }}
          >
            CodeBrief
          </span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <p
            className="text-2xl font-bold leading-snug tracking-tight mb-4"
            style={{ color: "#f1f5f9" }}
          >
            Pre-design code intelligence
            <br />
            <span style={{ color: "#3b82f6" }}>for architects.</span>
          </p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#475569" }}>
            Get a complete building code compliance brief in under 60 seconds.
            Zoning, fire separation, egress, accessibility, energy code, and
            risk flags — all in one report.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "20,000+ US jurisdictions covered",
              "IBC, IFC, ADA, IECC, IPC citations",
              "Tabular format with calculations",
              "Free tier — 2 briefs per month",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)" }}
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs" style={{ color: "#64748b" }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative text-[10px]" style={{ color: "#334155" }}>
          &copy; {new Date().getFullYear()} CodeBrief
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 5h12M4 8h8M4 11h10M4 14h6"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-semibold text-sm" style={{ color: "#0f172a" }}>
            CodeBrief
          </span>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Heading */}
          <div className="mb-7">
            <h1
              className="text-xl font-bold tracking-tight mb-1"
              style={{ color: "#0f172a" }}
            >
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {mode === "login"
                ? "Sign in to access your code analysis reports."
                : "Start generating code compliance briefs for free."}
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-5"
              style={{
                border: "1px solid #e2e8f0",
                color: "#334155",
                background: "#ffffff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8fafc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#ffffff")
              }
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-5">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div
                  className="w-full"
                  style={{ borderTop: "1px solid #f1f5f9" }}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-3 text-xs"
                  style={{ background: "#ffffff", color: "#94a3b8" }}
                >
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5"
                  style={{ color: "#64748b" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5"
                  style={{ color: "#64748b" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                />
              </div>

              {/* Feedback */}
              {error && (
                <div
                  className="p-3 rounded-lg flex items-start gap-2 text-xs"
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 5v3M8 10.5h.01"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {error}
                </div>
              )}
              {message && (
                <div
                  className="p-3 rounded-lg flex items-start gap-2 text-xs"
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  background: "#0f172a",
                  color: "#f1f5f9",
                }}
                onMouseEnter={(e) =>
                  !loading &&
                  (e.currentTarget.style.background = "#1e293b")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#0f172a")
                }
              >
                {loading ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="rgba(241,245,249,0.3)"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 2a6 6 0 016 6"
                        stroke="#f1f5f9"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Loading...
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          {/* Mode toggle */}
          <p className="mt-5 text-center text-xs" style={{ color: "#64748b" }}>
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setMessage("");
                  }}
                  className="font-semibold transition-colors"
                  style={{ color: "#3b82f6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#1d4ed8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#3b82f6")
                  }
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setMessage("");
                  }}
                  className="font-semibold transition-colors"
                  style={{ color: "#3b82f6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#1d4ed8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#3b82f6")
                  }
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="mt-3 text-center text-[10px]" style={{ color: "#cbd5e1" }}>
            Free tier includes 2 briefs per month. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
