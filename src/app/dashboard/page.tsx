"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";
import { PLANS } from "@/lib/stripe";
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

    // Count this month's usage
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const plan: PlanKey = profile?.plan || "free";
  const planConfig = PLANS[plan];
  const limit = planConfig.briefsPerMonth;
  const isUnlimited = limit === -1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">CodeBrief</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              New Brief
            </a>
            <span className="text-xs text-gray-400">{user.email}</span>
            <button
              onClick={signOut}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Usage + Plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Current Plan
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {planConfig.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {plan === "free"
                ? "Free — 2 briefs/month"
                : `$${planConfig.price}/month`}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Briefs This Month
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {usageCount}
              {!isUnlimited && (
                <span className="text-base font-normal text-gray-400">
                  {" "}
                  / {limit}
                </span>
              )}
            </p>
            {!isUnlimited && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min((usageCount / limit) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Total Briefs
            </p>
            <p className="text-2xl font-bold text-gray-900">{briefs.length}</p>
            {plan === "free" && (
              <button
                onClick={() => handleUpgrade("solo")}
                disabled={upgradeLoading}
                className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to Solo — $49/mo
              </button>
            )}
          </div>
        </div>

        {/* Pricing (for free users) */}
        {plan === "free" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Upgrade for more briefs
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Free tier includes 2 briefs per month. Upgrade anytime.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["solo", "firm", "enterprise"] as const).map((key) => (
                <div
                  key={key}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <p className="font-semibold text-gray-900">
                    {PLANS[key].name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${PLANS[key].price}
                    <span className="text-sm font-normal text-gray-400">
                      /mo
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {PLANS[key].briefsPerMonth === -1
                      ? "Unlimited briefs"
                      : `${PLANS[key].briefsPerMonth} briefs/month`}
                    {key === "firm" && " + 5 users"}
                    {key === "enterprise" && " + priority support"}
                  </p>
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={upgradeLoading}
                    className="mt-3 w-full text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Upgrade
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brief History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Briefs
          </h3>

          {briefs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-3">No briefs generated yet.</p>
              <a
                href="/"
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Your First Brief
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {briefs.map((brief) => (
                <div
                  key={brief.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedBrief(
                        expandedBrief === brief.id ? null : brief.id
                      )
                    }
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {brief.building_type} — {brief.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {brief.square_footage} SF | {brief.stories} stories |{" "}
                        {new Date(brief.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedBrief === brief.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {expandedBrief === brief.id && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {brief.brief_content}
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
