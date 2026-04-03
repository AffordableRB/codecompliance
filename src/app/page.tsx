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
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-slate-900 no-print">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 border-2 border-white/80 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">
                CB
              </span>
            </div>
            <span className="text-white font-semibold tracking-wide text-sm uppercase">
              CodeBrief
            </span>
          </a>
          <div className="flex items-center gap-4">
            {!authLoading &&
              (user ? (
                <a
                  href="/dashboard"
                  className="text-slate-300 hover:text-white text-xs font-medium tracking-wide uppercase transition-colors"
                >
                  Dashboard
                </a>
              ) : (
                <a
                  href="/login"
                  className="text-slate-300 hover:text-white text-xs font-medium tracking-wide uppercase transition-colors"
                >
                  Sign In
                </a>
              ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero — only when no brief is showing */}
        {!displayText && !loading && (
          <div className="bg-slate-900 text-white no-print">
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
              <div className="max-w-2xl">
                <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-4">
                  Pre-Design Intelligence
                </p>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 tracking-tight">
                  Code compliance briefs,
                  <br />
                  before you draw a line.
                </h1>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  Enter your project parameters. Get a professional code analysis
                  report covering zoning, construction type, fire separation,
                  egress, accessibility, energy code, and risk flags — with IBC
                  section citations and calculations. In 60 seconds.
                </p>
                <div className="flex items-center gap-6 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    20,000+ US jurisdictions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Tabular format with calculations
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    IBC / IFC / ADA / IECC citations
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Input Form */}
          {!brief && (
            <form onSubmit={generateBrief} className="max-w-3xl mx-auto">
              <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                {/* Form Header */}
                <div className="bg-slate-800 px-6 py-3">
                  <h2 className="text-white text-sm font-semibold tracking-wide uppercase">
                    Project Information
                  </h2>
                </div>

                <div className="p-6">
                  {/* Required Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                          <option value="">Select...</option>
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
                          onChange={(e) => update("location", e.target.value)}
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
                          placeholder="e.g., 25,000"
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

                  {/* Optional Fields */}
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">
                      Optional — improves accuracy
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
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
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <InputField
                      label="Project Notes"
                      input={
                        <textarea
                          value={form.additionalNotes}
                          onChange={(e) =>
                            update("additionalNotes", e.target.value)
                          }
                          rows={2}
                          placeholder="Renovation vs. new construction, specific concerns, use details..."
                          className="form-input"
                        />
                      }
                    />
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">
                    Analysis covers zoning, IBC, IFC, ADA, IECC, IPC, and local
                    amendments
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className="px-6 py-2 bg-slate-900 text-white text-xs font-semibold tracking-wide uppercase hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading
                        ? "Generating..."
                        : "Generate Code Analysis"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Loading State */}
          {loading && !streamText && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border border-slate-200 p-12 text-center">
                <div className="inline-block mb-4">
                  <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  Searching jurisdiction codes...
                </p>
                <p className="text-xs text-slate-400">
                  Querying public code databases and synthesizing your analysis.
                  30-60 seconds.
                </p>
              </div>
            </div>
          )}

          {/* Brief Output — Document Style */}
          {displayText && (
            <div ref={briefRef}>
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-3 no-print">
                <div className="flex items-center gap-2">
                  {loading && (
                    <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  )}
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {loading ? "Generating..." : "Code Analysis Report"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-[11px] font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors tracking-wide uppercase"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-3 py-1.5 text-[11px] font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors tracking-wide uppercase"
                  >
                    New Analysis
                  </button>
                </div>
              </div>

              {/* The Document */}
              <div className="report-document bg-white border border-slate-300 shadow-lg">
                {/* Document Header Band */}
                <div className="bg-slate-900 px-8 py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        Code Analysis Report
                      </p>
                      <h2 className="text-white text-lg font-bold mt-1 tracking-tight">
                        {form.buildingType}
                      </h2>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {form.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 border border-white/60 rounded flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">
                            CB
                          </span>
                        </div>
                        <span className="text-white/80 text-[10px] font-semibold tracking-widest uppercase">
                          CodeBrief
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {/* Project Data Strip */}
                  <div className="flex gap-6 mt-4 pt-3 border-t border-slate-700">
                    <DataPoint label="Gross Area" value={`${form.squareFootage} SF`} />
                    <DataPoint label="Stories" value={form.stories} />
                    {form.occupancyType && (
                      <DataPoint
                        label="Occupancy"
                        value={form.occupancyType.split(" ")[0]}
                      />
                    )}
                    {form.lotSize && (
                      <DataPoint label="Lot" value={form.lotSize} />
                    )}
                  </div>
                </div>

                {/* Brief Content */}
                <div className="px-8 py-6">
                  <div
                    className="brief-content"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(displayText),
                    }}
                  />
                </div>

                {/* Document Footer */}
                <div className="border-t border-slate-200 px-8 py-4">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-500">Disclaimer:</strong> This
                    report is AI-generated research guidance and does not
                    constitute legal or professional advice. Building codes are
                    life-safety regulations — verify all requirements with the
                    Authority Having Jurisdiction (AHJ) before proceeding with
                    design or permit applications.
                  </p>
                </div>

                {/* Branded Footer */}
                <div className="bg-slate-900 px-8 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-white/50 rounded flex items-center justify-center">
                      <span className="text-white text-[6px] font-bold">
                        CB
                      </span>
                    </div>
                    <span className="text-white/70 text-[10px] tracking-widest uppercase">
                      Generated by CodeBrief
                    </span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    codebrief.ai
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Site Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 no-print">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 tracking-wide">
            &copy; {new Date().getFullYear()} CodeBrief
          </span>
          <span className="text-[10px] text-slate-400">
            Pre-design code intelligence for architects
          </span>
        </div>
      </footer>
    </div>
  );
}

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
      <label className="block text-[11px] font-semibold tracking-wide uppercase text-slate-500 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {input}
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500 text-[9px] tracking-widest uppercase">
        {label}
      </p>
      <p className="text-white text-sm font-semibold">{value}</p>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string;
}
