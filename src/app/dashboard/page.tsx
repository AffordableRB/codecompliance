"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";
import { PLANS } from "@/lib/stripe";
import { marked } from "marked";
import type { PlanKey } from "@/lib/stripe";

interface Brief {
  id: string;
  building_type: string;
  location: string;
  square_footage: string;
  stories: string;
  brief_content: string;
  created_at: string;
}

interface Profile {
  plan: PlanKey;
  stripe_customer_id: string | null;
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    const [briefsRes, profileRes] = await Promise.all([
      supabase
        .from("briefs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    if (briefsRes.data) setBriefs(briefsRes.data);
    if (profileRes.data) setProfile(profileRes.data);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("briefs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    setUsageCount(count || 0);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading, router, loadData]);

  async function handleUpgrade(plan: "solo" | "firm" | "enterprise") {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
    }
    setUpgradeLoading(false);
  }

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8fafc" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#e2e8f0", borderTopColor: "#3b82f6" }}
          />
          <span className="text-sm" style={{ color: "#64748b" }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const plan: PlanKey = profile?.plan || "free";
  const planConfig = PLANS[plan];
  const limit = planConfig.briefsPerMonth;
  const isUnlimited = limit === -1;
  const usagePct = isUnlimited ? 0 : Math.min((usageCount / limit) * 100, 100);

  const planBadgeColor: Record<PlanKey, { bg: string; text: string; border: string }> = {
    free: { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" },
    solo: { bg: "rgba(59,130,246,0.08)", text: "#1d4ed8", border: "rgba(59,130,246,0.2)" },
    firm: { bg: "rgba(124,58,237,0.08)", text: "#6d28d9", border: "rgba(124,58,237,0.2)" },
    enterprise: { bg: "rgba(16,185,129,0.08)", text: "#065f46", border: "rgba(16,185,129,0.2)" },
  };
  const badge = planBadgeColor[plan];

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* ── Header ── */}
      <header
        style={{
          background: "#0a0f1e",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
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
            <span
              className="font-semibold text-sm tracking-tight"
              style={{ color: "#f1f5f9" }}
            >
              CodeBrief
            </span>
          </a>

          {/* Nav */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#60a5fa",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(59,130,246,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(59,130,246,0.12)")
              }
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2l6 6H2l6-6zM3 8h10v6H3V8z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
              </svg>
              New Brief
            </a>
            <span className="text-xs" style={{ color: "#475569" }}>
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="text-xs transition-colors"
              style={{ color: "#475569" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ── Page Title ── */}
        <div className="mb-7">
          <h1
            className="text-xl font-bold tracking-tight mb-1"
            style={{ color: "#0f172a" }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Your code analysis reports and account overview.
          </p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Plan */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#94a3b8" }}
            >
              Current Plan
            </p>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: "#0f172a" }}
              >
                {planConfig.name}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase"
                style={{
                  background: badge.bg,
                  color: badge.text,
                  border: `1px solid ${badge.border}`,
                }}
              >
                {plan}
              </span>
            </div>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {plan === "free"
                ? "Free — 2 briefs / month"
                : `$${planConfig.price} / month`}
            </p>
          </div>

          {/* Usage */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#94a3b8" }}
            >
              Briefs This Month
            </p>
            <p
              className="text-2xl font-bold tracking-tight mb-2"
              style={{ color: "#0f172a" }}
            >
              {usageCount}
              {!isUnlimited && (
                <span
                  className="text-base font-normal ml-1"
                  style={{ color: "#94a3b8" }}
                >
                  / {limit}
                </span>
              )}
            </p>
            {!isUnlimited && (
              <div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#f1f5f9" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${usagePct}%`,
                      background:
                        usagePct >= 90
                          ? "#ef4444"
                          : usagePct >= 70
                          ? "#f59e0b"
                          : "#3b82f6",
                    }}
                  />
                </div>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: "#94a3b8" }}
                >
                  {isUnlimited
                    ? "Unlimited"
                    : `${limit - usageCount} remaining`}
                </p>
              </div>
            )}
            {isUnlimited && (
              <p className="text-xs" style={{ color: "#22c55e" }}>
                Unlimited
              </p>
            )}
          </div>

          {/* Total */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#94a3b8" }}
            >
              Total Briefs
            </p>
            <p
              className="text-2xl font-bold tracking-tight mb-2"
              style={{ color: "#0f172a" }}
            >
              {briefs.length}
            </p>
            {plan === "free" && (
              <button
                onClick={() => handleUpgrade("solo")}
                disabled={upgradeLoading}
                className="inline-flex items-center gap-1 text-[10px] font-semibold transition-colors"
                style={{ color: "#3b82f6" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#3b82f6")
                }
              >
                Upgrade for more
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6h8M6 2l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Upgrade Banner (free users) ── */}
        {plan === "free" && (
          <div
            className="rounded-xl p-6 mb-8 relative overflow-hidden"
            style={{
              background: "#0a0f1e",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            {/* Glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-40px",
                right: "-40px",
                width: "300px",
                height: "300px",
                background:
                  "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 65%)",
              }}
            />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3
                    className="text-base font-bold tracking-tight mb-1"
                    style={{ color: "#f1f5f9" }}
                  >
                    Upgrade your plan
                  </h3>
                  <p className="text-xs" style={{ color: "#475569" }}>
                    Free tier includes 2 briefs per month. Upgrade anytime — cancel
                    anytime.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["solo", "firm", "enterprise"] as const).map((key) => (
                  <div
                    key={key}
                    className="rounded-lg p-4 relative"
                    style={{
                      background: key === "firm" ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.04)",
                      border: key === "firm"
                        ? "1px solid rgba(124,58,237,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {key === "firm" && (
                      <span
                        className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase"
                        style={{
                          background: "#7c3aed",
                          color: "#ffffff",
                        }}
                      >
                        Popular
                      </span>
                    )}
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{ color: "#f1f5f9" }}
                    >
                      {PLANS[key].name}
                    </p>
                    <p
                      className="text-xl font-bold mb-1"
                      style={{ color: "#f1f5f9" }}
                    >
                      ${PLANS[key].price}
                      <span
                        className="text-xs font-normal ml-1"
                        style={{ color: "#64748b" }}
                      >
                        /mo
                      </span>
                    </p>
                    <p className="text-[10px] mb-3" style={{ color: "#475569" }}>
                      {PLANS[key].briefsPerMonth === -1
                        ? "Unlimited briefs"
                        : `${PLANS[key].briefsPerMonth} briefs / month`}
                      {key === "firm" && " · 5 users"}
                      {key === "enterprise" && " · priority support"}
                    </p>
                    <button
                      onClick={() => handleUpgrade(key)}
                      disabled={upgradeLoading}
                      className="w-full py-1.5 rounded-md text-[10px] font-semibold tracking-wide uppercase transition-colors disabled:opacity-50"
                      style={
                        key === "firm"
                          ? { background: "#7c3aed", color: "#ffffff" }
                          : {
                              background: "rgba(255,255,255,0.08)",
                              color: "#94a3b8",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (key === "firm") {
                          e.currentTarget.style.background = "#6d28d9";
                        } else {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.12)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (key === "firm") {
                          e.currentTarget.style.background = "#7c3aed";
                        } else {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)";
                        }
                      }}
                    >
                      Upgrade
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Brief History ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-bold tracking-tight"
              style={{ color: "#0f172a" }}
            >
              Your Briefs
            </h2>
            {briefs.length > 0 && (
              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {briefs.length} report{briefs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {briefs.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#0f172a" }}
              >
                No briefs yet
              </p>
              <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>
                Generate your first code analysis report to get started.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: "#0f172a", color: "#f1f5f9" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1e293b")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#0f172a")
                }
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2l6 6H2l6-6zM3 8h10v6H3V8z"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />
                </svg>
                Generate Your First Brief
              </a>
            </div>
          ) : (
            <div className="space-y-2.5">
              {briefs.map((brief) => (
                <div
                  key={brief.id}
                  className="rounded-xl overflow-hidden transition-shadow"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Row header */}
                  <button
                    onClick={() =>
                      setExpandedBrief(
                        expandedBrief === brief.id ? null : brief.id
                      )
                    }
                    className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors"
                    style={{
                      background:
                        expandedBrief === brief.id ? "#f8fafc" : "#ffffff",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        expandedBrief === brief.id ? "#f8fafc" : "#ffffff")
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 3h10M3 6h7M3 9h8M3 12h5"
                            stroke="#64748b"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "#0f172a" }}
                        >
                          {brief.building_type}
                          <span
                            className="font-normal ml-1.5"
                            style={{ color: "#94a3b8" }}
                          >
                            —
                          </span>
                          <span
                            className="ml-1.5 font-normal"
                            style={{ color: "#475569" }}
                          >
                            {brief.location}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span
                            className="text-[10px]"
                            style={{ color: "#94a3b8" }}
                          >
                            {brief.square_footage} SF
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "#e2e8f0" }}
                          >
                            ·
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "#94a3b8" }}
                          >
                            {brief.stories}{" "}
                            {parseInt(brief.stories) === 1
                              ? "story"
                              : "stories"}
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "#e2e8f0" }}
                          >
                            ·
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "#94a3b8" }}
                          >
                            {new Date(brief.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <svg
                        className="w-4 h-4 transition-transform duration-200"
                        style={{
                          color: "#94a3b8",
                          transform:
                            expandedBrief === brief.id
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {expandedBrief === brief.id && (
                    <div
                      style={{ borderTop: "1px solid #f1f5f9" }}
                    >
                      {/* Report header strip */}
                      <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{
                          background: "#0f172a",
                        }}
                      >
                        <div>
                          <p
                            className="text-[8px] font-bold tracking-[0.2em] uppercase mb-0.5"
                            style={{ color: "#3b82f6" }}
                          >
                            Code Analysis Report
                          </p>
                          <p
                            className="text-xs font-semibold"
                            style={{ color: "#f1f5f9" }}
                          >
                            {brief.building_type} — {brief.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px]"
                            style={{ color: "#475569" }}
                          >
                            {new Date(brief.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Brief content */}
                      <div className="px-6 py-5 max-h-[520px] overflow-y-auto">
                        <div
                          className="brief-content"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(brief.brief_content),
                          }}
                        />
                      </div>

                      {/* Footer */}
                      <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{
                          borderTop: "1px solid #f1f5f9",
                          background: "#f8fafc",
                        }}
                      >
                        <p
                          className="text-[9px] leading-relaxed max-w-lg"
                          style={{ color: "#94a3b8" }}
                        >
                          AI-generated guidance only. Verify all requirements
                          with the Authority Having Jurisdiction (AHJ).
                        </p>
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1 text-[10px] font-medium transition-colors"
                          style={{ color: "#64748b" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#0f172a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#64748b")
                          }
                        >
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M4 5V2h8v3M4 11H2V6h12v5h-2M4 9h8v5H4V9z"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Print
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
