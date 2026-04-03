"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-browser";
import { marked } from "marked";

interface ProjectInput {
  buildingType: string;
  location: string;
  squareFootage: string;
  stories: string;
  occupancyType: string;
  occupantLoad: string;
  lotSize: string;
  additionalNotes: string;
}

const BUILDING_TYPES = [
  "Single-Family Residential",
  "Multi-Family Residential",
  "Mixed-Use (Residential/Commercial)",
  "Office / Commercial",
  "Retail",
  "Restaurant / Food Service",
  "Hotel / Hospitality",
  "K-12 School",
  "Higher Education",
  "Healthcare / Medical Office",
  "Hospital",
  "Assembly / Event Space",
  "Warehouse / Industrial",
  "Religious / House of Worship",
  "Parking Structure",
  "Other",
];

const OCCUPANCY_TYPES = [
  "A-1 Assembly (theater, concert hall)",
  "A-2 Assembly (restaurant, bar, banquet)",
  "A-3 Assembly (worship, recreation, museum)",
  "A-4 Assembly (arena, indoor sports)",
  "A-5 Assembly (outdoor, stadium)",
  "B Business (office, professional)",
  "E Educational",
  "F-1 Factory / Industrial (moderate hazard)",
  "F-2 Factory / Industrial (low hazard)",
  "H Hazardous",
  "I-1 Institutional (assisted living)",
  "I-2 Institutional (hospital, nursing home)",
  "I-3 Institutional (detention)",
  "M Mercantile (retail, department store)",
  "R-1 Residential (hotel, motel)",
  "R-2 Residential (apartment, dormitory)",
  "R-3 Residential (1-2 family dwelling)",
  "R-4 Residential (care facility, small)",
  "S-1 Storage (moderate hazard)",
  "S-2 Storage (low hazard)",
  "U Utility / Miscellaneous",
  "Not sure — help me classify",
];

const initialForm: ProjectInput = {
  buildingType: "",
  location: "",
  squareFootage: "",
  stories: "",
  occupancyType: "",
  occupantLoad: "",
  lotSize: "",
  additionalNotes: "",
};

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<ProjectInput>(initialForm);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamText, setStreamText] = useState("");
  const briefRef = useRef<HTMLDivElement>(null);

  const update = (field: keyof ProjectInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canSubmit =
    form.buildingType && form.location && form.squareFootage && form.stories;

  async function generateBrief(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setBrief("");
    setStreamText("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || `Request failed with status ${res.status}`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamText(accumulated);
      }

      setBrief(accumulated);
      setStreamText("");

      if (user) {
        supabase
          .from("briefs")
          .insert({
            user_id: user.id,
            building_type: form.buildingType,
            location: form.location,
            square_footage: form.squareFootage,
            stories: form.stories,
            occupancy_type: form.occupancyType || null,
            brief_content: accumulated,
            input_json: form,
          })
          .then(() => {});
      }

      setTimeout(() => {
        briefRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setBrief("");
    setError("");
    setStreamText("");
  }

  const displayText = streamText || brief;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8fafc" }}>
      {/* ── Navigation ── */}
      <nav
        className="no-print sticky top-0 z-50"
        style={{
          background: "#0a0f1e",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between"
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)" }}
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
              className="font-semibold tracking-tight text-sm"
              style={{ color: "#f1f5f9" }}
            >
              CodeBrief
            </span>
          </a>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {!authLoading &&
              (user ? (
                <a
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#94a3b8")
                  }
                >
                  Dashboard
                </a>
              ) : (
                <a
                  href="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#94a3b8")
                  }
                >
                  Sign In
                </a>
              ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero ── */}
        {!displayText && !loading && (
          <div
            className="no-print relative overflow-hidden"
            style={{ background: "#0a0f1e" }}
          >
            {/* Subtle grid texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
            {/* Glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-80px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "600px",
                height: "400px",
                background:
                  "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
              }}
            />

            <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
              <div className="max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 mb-6">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase"
                    style={{
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      color: "#60a5fa",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#3b82f6" }}
                    />
                    Pre-Design Intelligence
                  </span>
                </div>

                <h1
                  className="text-3xl md:text-[2.625rem] font-bold leading-[1.15] tracking-tight mb-5"
                  style={{ color: "#f1f5f9" }}
                >
                  Code compliance briefs,
                  <br />
                  <span style={{ color: "#60a5fa" }}>before you draw a line.</span>
                </h1>

                <p
                  className="text-base leading-relaxed mb-8 max-w-xl"
                  style={{ color: "#64748b" }}
                >
                  Enter your project parameters. Get a professional code analysis
                  covering zoning, construction type, fire separation, egress,
                  accessibility, energy code, and risk flags — with IBC section
                  citations and calculations. In 60 seconds.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {[
                    "20,000+ US jurisdictions",
                    "IBC / IFC / ADA / IECC citations",
                    "Tabular calculations",
                  ].map((feat) => (
                    <span
                      key={feat}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "#475569" }}
                    >
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle cx="8" cy="8" r="7" stroke="#3b82f6" strokeWidth="1.5" />
                        <path
                          d="M5 8l2 2 4-4"
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Content Area ── */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* ── Input Form ── */}
          {!brief && (
            <form onSubmit={generateBrief} className="max-w-3xl mx-auto">
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
                }}
              >
                {/* Form Header */}
                <div
                  className="px-6 py-4 flex items-center gap-3"
                  style={{
                    background: "#0f172a",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.2)" }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 4h10M3 7h7M3 10h8M3 13h5"
                        stroke="#60a5fa"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h2
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "#e2e8f0" }}
                  >
                    Project Information
                  </h2>
                </div>

                <div className="p-6">
                  {/* Required Fields */}
                  <div className="mb-1">
                    <p
                      className="text-[10px] font-semibold tracking-widest uppercase mb-4"
                      style={{ color: "#94a3b8" }}
                    >
                      Required
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                      <InputField
                        label="Building Type"
                        required
                        input={
                          <select
                            value={form.buildingType}
                            onChange={(e) =>
                              update("buildingType", e.target.value)
                            }
                            className="form-input"
                            required
                          >
                            <option value="">Select type...</option>
                            {BUILDING_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        }
                      />
                      <InputField
                        label="Location"
                        required
                        input={
                          <input
                            type="text"
                            value={form.location}
                            onChange={(e) =>
                              update("location", e.target.value)
                            }
                            placeholder="City, State or full address"
                            className="form-input"
                            required
                          />
                        }
                      />
                      <InputField
                        label="Gross Area (SF)"
                        required
                        input={
                          <input
                            type="text"
                            value={form.squareFootage}
                            onChange={(e) =>
                              update("squareFootage", e.target.value)
                            }
                            placeholder="e.g., 12,500"
                            className="form-input"
                            required
                          />
                        }
                      />
                      <InputField
                        label="Stories Above Grade"
                        required
                        input={
                          <input
                            type="text"
                            value={form.stories}
                            onChange={(e) => update("stories", e.target.value)}
                            placeholder="e.g., 4"
                            className="form-input"
                            required
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div
                    className="mt-6 pt-6"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <p
                      className="text-[10px] font-semibold tracking-widest uppercase mb-4"
                      style={{ color: "#94a3b8" }}
                    >
                      Optional — improves accuracy
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                      <InputField
                        label="Occupancy Group"
                        input={
                          <select
                            value={form.occupancyType}
                            onChange={(e) =>
                              update("occupancyType", e.target.value)
                            }
                            className="form-input"
                          >
                            <option value="">Auto-classify</option>
                            {OCCUPANCY_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        }
                      />
                      <InputField
                        label="Occupant Load"
                        input={
                          <input
                            type="text"
                            value={form.occupantLoad}
                            onChange={(e) =>
                              update("occupantLoad", e.target.value)
                            }
                            placeholder="e.g., 200"
                            className="form-input"
                          />
                        }
                      />
                      <InputField
                        label="Lot Size"
                        input={
                          <input
                            type="text"
                            value={form.lotSize}
                            onChange={(e) => update("lotSize", e.target.value)}
                            placeholder="e.g., 10,000 SF"
                            className="form-input"
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div
                    className="mt-6 pt-6"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <InputField
                      label="Project Notes"
                      input={
                        <textarea
                          value={form.additionalNotes}
                          onChange={(e) =>
                            update("additionalNotes", e.target.value)
                          }
                          rows={3}
                          placeholder="Renovation vs. new construction, specific concerns, use details, known variances..."
                          className="form-input"
                          style={{ resize: "vertical" }}
                        />
                      }
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      className="mt-5 p-3.5 rounded-lg flex items-start gap-2.5 text-sm"
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#b91c1c",
                      }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
                        <path
                          d="M8 5v3.5M8 11h.01"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      {error}
                    </div>
                  )}
                </div>

                {/* Submit Footer */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{
                    background: "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                    Covers zoning · IBC · IFC · ADA · IECC · IPC · local amendments
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3.5 py-2 text-xs font-medium rounded-md transition-colors"
                      style={{ color: "#64748b" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#0f172a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#64748b")
                      }
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-xs font-semibold tracking-wide uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: canSubmit && !loading ? "#0f172a" : "#0f172a",
                        color: "#f1f5f9",
                      }}
                      onMouseEnter={(e) => {
                        if (canSubmit && !loading)
                          e.currentTarget.style.background = "#1e293b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#0f172a";
                      }}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="w-3 h-3 animate-spin"
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
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M3 8h10M9 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Generate Analysis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ── Loading State ── */}
          {loading && !streamText && (
            <div className="max-w-3xl mx-auto">
              <div
                className="rounded-xl p-14 text-center"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {/* Animated rings */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div
                    className="absolute w-16 h-16 rounded-full border-2 animate-ping"
                    style={{
                      borderColor: "rgba(59,130,246,0.2)",
                      animationDuration: "1.5s",
                    }}
                  />
                  <div
                    className="w-11 h-11 rounded-full border-2 border-t-transparent animate-spin"
                    style={{
                      borderColor: "#e2e8f0",
                      borderTopColor: "#3b82f6",
                    }}
                  />
                </div>
                <p
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#0f172a" }}
                >
                  Searching jurisdiction codes...
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  Querying public code databases and synthesizing your analysis.
                  Typically 30–60 seconds.
                </p>
              </div>
            </div>
          )}

          {/* ── Brief Output ── */}
          {displayText && (
            <div ref={briefRef} className="max-w-4xl mx-auto">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 no-print">
                <div className="flex items-center gap-2.5">
                  {loading && (
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: "#e2e8f0",
                        borderTopColor: "#3b82f6",
                      }}
                    />
                  )}
                  <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: loading ? "#3b82f6" : "#64748b" }}
                  >
                    {loading ? "Generating report..." : "Code Analysis Report"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] font-medium tracking-wide uppercase transition-colors"
                    style={{
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#ffffff")
                    }
                  >
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 5V2h8v3M4 11H2V6h12v5h-2M4 9h8v5H4V9z"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Export PDF
                  </button>
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] font-medium tracking-wide uppercase transition-colors"
                    style={{
                      color: "#f1f5f9",
                      background: "#0f172a",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#1e293b")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#0f172a")
                    }
                  >
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 8a6 6 0 1012 0A6 6 0 002 8zM8 5v3l2 2"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                    </svg>
                    New Analysis
                  </button>
                </div>
              </div>

              {/* The Document */}
              <div
                className="report-document rounded-xl overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)",
                }}
              >
                {/* Document Header */}
                <div
                  className="px-8 py-6"
                  style={{ background: "#0a0f1e" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2"
                        style={{ color: "#3b82f6" }}
                      >
                        Code Analysis Report
                      </p>
                      <h2
                        className="text-xl font-bold tracking-tight mb-1"
                        style={{ color: "#f1f5f9" }}
                      >
                        {form.buildingType}
                      </h2>
                      <p className="text-sm" style={{ color: "#64748b" }}>
                        {form.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{
                            background: "rgba(59,130,246,0.15)",
                            border: "1px solid rgba(59,130,246,0.3)",
                          }}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M3 3h10M3 6h7M3 9h8M3 12h5"
                              stroke="#60a5fa"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <span
                          className="text-[10px] font-semibold tracking-widest uppercase"
                          style={{ color: "rgba(241,245,249,0.7)" }}
                        >
                          CodeBrief
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: "#475569" }}>
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Data Strip */}
                  <div
                    className="flex flex-wrap gap-6 mt-5 pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <DataPoint label="Gross Area" value={`${form.squareFootage} SF`} />
                    <DataPoint label="Stories" value={form.stories} />
                    {form.occupancyType && (
                      <DataPoint
                        label="Occupancy"
                        value={form.occupancyType.split(" ")[0]}
                      />
                    )}
                    {form.occupantLoad && (
                      <DataPoint label="Occupant Load" value={form.occupantLoad} />
                    )}
                    {form.lotSize && (
                      <DataPoint label="Lot Size" value={form.lotSize} />
                    )}
                  </div>
                </div>

                {/* Brief Content */}
                <div className="px-8 py-7">
                  <div
                    className={`brief-content${loading ? " streaming-cursor" : ""}`}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(displayText),
                    }}
                  />
                </div>

                {/* Disclaimer */}
                <div
                  className="px-8 py-4 mx-6 mb-6 rounded-lg"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
                    <strong style={{ color: "#64748b" }}>Disclaimer:</strong>{" "}
                    This report is AI-generated research guidance and does not
                    constitute legal or professional advice. Building codes are
                    life-safety regulations — verify all requirements with the
                    Authority Having Jurisdiction (AHJ) before proceeding with
                    design or permit applications.
                  </p>
                </div>

                {/* Branded Footer */}
                <div
                  className="px-8 py-3.5 flex items-center justify-between"
                  style={{
                    background: "#0a0f1e",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        border: "1px solid rgba(59,130,246,0.25)",
                      }}
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1.5 2.5h7M1.5 4.5h5M1.5 6.5h6M1.5 8.5h3.5"
                          stroke="#60a5fa"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-[9px] tracking-widest uppercase"
                      style={{ color: "rgba(241,245,249,0.4)" }}
                    >
                      Generated by CodeBrief
                    </span>
                  </div>
                  <span className="text-[9px]" style={{ color: "#334155" }}>
                    codebrief.ai
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Site Footer ── */}
      <footer
        className="no-print mt-auto"
        style={{
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 3h8M2 5.5h5.5M2 8h6.5M2 10.5h4"
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[11px]" style={{ color: "#94a3b8" }}>
              &copy; {new Date().getFullYear()} CodeBrief
            </span>
          </div>
          <span className="text-[11px]" style={{ color: "#cbd5e1" }}>
            Pre-design code intelligence for architects
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function InputField({
  label,
  required,
  input,
}: {
  label: string;
  required?: boolean;
  input: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5"
        style={{ color: "#64748b" }}
      >
        {label}
        {required && (
          <span style={{ color: "#f87171", marginLeft: "3px" }}>*</span>
        )}
      </label>
      {input}
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[8px] tracking-widest uppercase mb-0.5"
        style={{ color: "#475569" }}
      >
        {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>
        {value}
      </p>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string;
}
