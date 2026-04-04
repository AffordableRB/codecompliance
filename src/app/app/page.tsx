"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-browser";
import { marked } from "marked";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

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

interface SavedBrief {
  id: string;
  building_type: string;
  location: string;
  square_footage: string;
  stories: string;
  occupancy_type: string | null;
  brief_content: string;
  created_at: string;
  input_json: ProjectInput | null;
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

/* ═══════════════════════════════════════════
   PROGRESS MESSAGES
   ═══════════════════════════════════════════ */

const PROGRESS_STEPS = [
  "Identifying jurisdiction and applicable codes...",
  "Searching zoning ordinances and land use regulations...",
  "Checking IBC adoption and local amendments...",
  "Analyzing fire separation and sprinkler requirements...",
  "Calculating egress and occupant loads...",
  "Reviewing ADA and accessibility standards...",
  "Checking energy code (IECC) requirements...",
  "Analyzing parking and transportation requirements...",
  "Compiling risk flags and special conditions...",
  "Generating code analysis report...",
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function AppWorkspace() {
  const { user, signOut, loading: authLoading } = useAuth();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>([]);
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<ProjectInput>(initialForm);
  const [mode, setMode] = useState<"form" | "generating" | "viewing">("form");

  // Generation state
  const [streamText, setStreamText] = useState("");
  const [completedBrief, setCompletedBrief] = useState("");
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] = useState(0);

  const briefRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSubmit =
    form.buildingType && form.location && form.squareFootage && form.stories;

  // Load saved briefs
  const loadBriefs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("briefs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setSavedBriefs(data);
  }, [user]);

  useEffect(() => {
    loadBriefs();
  }, [loadBriefs]);

  // Progress animation during generation
  useEffect(() => {
    if (mode === "generating" && !streamText) {
      setProgressStep(0);
      progressInterval.current = setInterval(() => {
        setProgressStep((prev) =>
          prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 4000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [mode, streamText]);

  const update = (field: keyof ProjectInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Start new brief
  function handleNewBrief() {
    setForm(initialForm);
    setMode("form");
    setStreamText("");
    setCompletedBrief("");
    setError("");
    setActiveBriefId(null);
  }

  // View a saved brief
  function handleSelectBrief(brief: SavedBrief) {
    setActiveBriefId(brief.id);
    setCompletedBrief(brief.brief_content);
    setStreamText("");
    setMode("viewing");
    setError("");
    // Restore form data if available
    if (brief.input_json) {
      setForm(brief.input_json);
    } else {
      setForm({
        ...initialForm,
        buildingType: brief.building_type,
        location: brief.location,
        squareFootage: brief.square_footage,
        stories: brief.stories,
        occupancyType: brief.occupancy_type || "",
      });
    }
  }

  // Generate brief
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setMode("generating");
    setError("");
    setStreamText("");
    setCompletedBrief("");
    setActiveBriefId(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamText(accumulated);
      }

      setCompletedBrief(accumulated);
      setStreamText("");
      setMode("viewing");

      // Save to database
      if (user) {
        const { data } = await supabase
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
          .select("id")
          .single();

        if (data) {
          setActiveBriefId(data.id);
          loadBriefs();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMode("form");
    }
  }

  // Delete a brief
  async function handleDeleteBrief(id: string) {
    await supabase.from("briefs").delete().eq("id", id);
    if (activeBriefId === id) handleNewBrief();
    loadBriefs();
  }

  const displayContent = streamText || completedBrief;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"} flex-shrink-0 flex flex-col transition-all duration-200 overflow-hidden`}
        style={{ background: "var(--bg-dark)", borderRight: "1px solid #222" }}
      >
        <div className="flex flex-col h-full w-72">
          {/* Sidebar Header */}
          <div className="px-4 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #222" }}>
            <a href="/" className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                style={{ border: "1px solid rgba(245,242,238,0.3)" }}
              >
                <span className="text-[8px] font-bold" style={{ color: "#f5f2ee" }}>CB</span>
              </div>
              <span
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: "#f5f2ee", letterSpacing: "0.12em" }}
              >
                CodeBrief
              </span>
            </a>
          </div>

          {/* New Brief Button */}
          <div className="px-3 py-3">
            <button
              onClick={handleNewBrief}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium tracking-wide transition-colors"
              style={{
                background: "rgba(245,242,238,0.08)",
                color: "#f5f2ee",
                border: "1px solid rgba(245,242,238,0.12)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,242,238,0.14)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,242,238,0.08)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Brief
            </button>
          </div>

          {/* Brief History */}
          <div className="flex-1 overflow-y-auto px-2">
            <p
              className="px-2 py-2 text-[9px] font-semibold tracking-widest uppercase"
              style={{ color: "rgba(245,242,238,0.3)" }}
            >
              History
            </p>
            {savedBriefs.length === 0 ? (
              <p className="px-2 py-4 text-xs" style={{ color: "rgba(245,242,238,0.2)" }}>
                No briefs yet
              </p>
            ) : (
              <div className="space-y-0.5">
                {savedBriefs.map((brief) => (
                  <button
                    key={brief.id}
                    onClick={() => handleSelectBrief(brief)}
                    className="w-full text-left px-3 py-2.5 rounded-sm transition-colors group relative"
                    style={{
                      background: activeBriefId === brief.id ? "rgba(245,242,238,0.1)" : "transparent",
                      color: activeBriefId === brief.id ? "#f5f2ee" : "rgba(245,242,238,0.5)",
                    }}
                    onMouseEnter={(e) => {
                      if (activeBriefId !== brief.id)
                        e.currentTarget.style.background = "rgba(245,242,238,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (activeBriefId !== brief.id)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <p className="text-xs font-medium truncate">{brief.building_type}</p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(245,242,238,0.3)" }}>
                      {brief.location}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: "rgba(245,242,238,0.2)" }}>
                      {new Date(brief.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {/* Delete button */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBrief(brief.id);
                      }}
                      className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ color: "rgba(245,242,238,0.3)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(245,242,238,0.7)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,242,238,0.3)")}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer — User */}
          <div className="px-4 py-3" style={{ borderTop: "1px solid #222" }}>
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-[10px] truncate" style={{ color: "rgba(245,242,238,0.4)" }}>
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="text-[10px] transition-colors"
                  style={{ color: "rgba(245,242,238,0.25)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(245,242,238,0.6)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,242,238,0.25)")}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="block text-center text-[10px] py-1.5 transition-colors"
                style={{ color: "rgba(245,242,238,0.5)", border: "1px solid rgba(245,242,238,0.12)" }}
              >
                Sign in to save briefs
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-6 py-2.5 flex-shrink-0 no-print"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              {mode === "form" && "New Brief"}
              {mode === "generating" && "Generating..."}
              {mode === "viewing" && `${form.buildingType} — ${form.location}`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {mode === "viewing" && (
              <>
                <button
                  onClick={() => window.print()}
                  className="text-[10px] tracking-widest uppercase transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Export PDF
                </button>
                <button
                  onClick={handleNewBrief}
                  className="px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase transition-colors"
                  style={{ background: "var(--bg-dark)", color: "var(--text-inverse)" }}
                >
                  New Brief
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* ═══ FORM MODE ═══ */}
          {mode === "form" && (
            <div className="max-w-2xl mx-auto px-6 py-12">
              <div className="text-center mb-8">
                <h1
                  className="text-2xl font-light tracking-tight mb-2"
                  style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  Every applicable code. One report.
                </h1>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Enter your project — get a complete code analysis including the requirements you didn&apos;t know to search for.
                </p>

                {/* Value Strip */}
                <div className="flex items-center justify-center gap-5 flex-wrap">
                  {[
                    { num: "20,000+", label: "US Jurisdictions" },
                    { num: "12", label: "Code Domains" },
                    { num: "60s", label: "Delivery" },
                    { num: "IBC", label: "Citations & Math" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{stat.num}</span>
                      <span className="text-[9px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGenerate}>
                <div style={{ background: "#fff", border: "1px solid var(--border-medium)" }}>
                  {/* Form Header */}
                  <div className="px-6 py-3" style={{ background: "var(--bg-dark)" }}>
                    <h2 className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-inverse)" }}>
                      Project Information
                    </h2>
                  </div>

                  <div className="px-6 py-5">
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                      <FormField label="Building Type" required>
                        <select value={form.buildingType} onChange={(e) => update("buildingType", e.target.value)} className="form-input" required>
                          <option value="">Select...</option>
                          {BUILDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Location" required>
                        <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State or address" className="form-input" required />
                      </FormField>
                      <FormField label="Gross Area (SF)" required>
                        <input type="text" value={form.squareFootage} onChange={(e) => update("squareFootage", e.target.value)} placeholder="e.g., 25,000" className="form-input" required />
                      </FormField>
                      <FormField label="Stories" required>
                        <input type="text" value={form.stories} onChange={(e) => update("stories", e.target.value)} placeholder="e.g., 4" className="form-input" required />
                      </FormField>
                    </div>

                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                      <p className="text-[9px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                        Optional
                      </p>
                      <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                        <FormField label="Occupancy">
                          <select value={form.occupancyType} onChange={(e) => update("occupancyType", e.target.value)} className="form-input">
                            <option value="">Auto</option>
                            {OCCUPANCY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </FormField>
                        <FormField label="Occupant Load">
                          <input type="text" value={form.occupantLoad} onChange={(e) => update("occupantLoad", e.target.value)} placeholder="e.g., 200" className="form-input" />
                        </FormField>
                        <FormField label="Lot Size">
                          <input type="text" value={form.lotSize} onChange={(e) => update("lotSize", e.target.value)} placeholder="e.g., 10,000 SF" className="form-input" />
                        </FormField>
                      </div>
                    </div>

                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                      <FormField label="Notes">
                        <textarea value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} rows={2} placeholder="Renovation vs. new construction, specific concerns..." className="form-input" />
                      </FormField>
                    </div>
                  </div>

                  {/* Submit Bar */}
                  <div className="px-6 py-3 flex items-center justify-between" style={{ background: "var(--bg-warm)", borderTop: "1px solid var(--border-light)" }}>
                    <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                      IBC · IFC · ADA · IECC · IPC · Local amendments
                    </span>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="px-5 py-2 text-[10px] font-semibold tracking-widest uppercase transition-opacity disabled:opacity-30"
                      style={{ background: "var(--bg-dark)", color: "var(--text-inverse)" }}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 px-4 py-3 text-xs" style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "var(--error)" }}>
                    {error}
                  </div>
                )}
              </form>

              {/* Sample Report Preview */}
              <SampleReportPreview />
            </div>
          )}

          {/* ═══ GENERATING MODE ═══ */}
          {mode === "generating" && !streamText && (
            <div className="max-w-xl mx-auto px-6 py-20">
              <div className="space-y-3">
                {PROGRESS_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 transition-opacity duration-500"
                    style={{ opacity: i <= progressStep ? 1 : 0.15 }}
                  >
                    {i < progressStep ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : i === progressStep ? (
                      <div
                        className="w-3.5 h-3.5 border border-t-transparent animate-spin"
                        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                      />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full" style={{ background: "var(--border-light)" }} />
                    )}
                    <span className="text-xs" style={{ color: i <= progressStep ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STREAMING / VIEWING MODE ═══ */}
          {displayContent && (
            <div ref={briefRef} className="max-w-4xl mx-auto px-6 py-8">
              {/* Document */}
              <div className="report-document" style={{ background: "#fff", border: "1px solid var(--border-medium)" }}>
                {/* Header Band */}
                <div className="px-8 py-5" style={{ background: "var(--bg-dark)" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "var(--accent-light)" }}>
                        Code Analysis Report
                      </p>
                      <h2 className="text-lg font-light tracking-tight mt-1" style={{ color: "#f5f2ee", letterSpacing: "-0.02em" }}>
                        {form.buildingType}
                      </h2>
                      <p className="text-sm mt-0.5" style={{ color: "rgba(245,242,238,0.5)" }}>
                        {form.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 flex items-center justify-center" style={{ border: "1px solid rgba(245,242,238,0.3)" }}>
                          <span className="text-[7px] font-bold" style={{ color: "#f5f2ee" }}>CB</span>
                        </div>
                        <span className="text-[9px] font-medium tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.6)" }}>
                          CodeBrief
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: "rgba(245,242,238,0.3)" }}>
                        {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  {/* Data Strip */}
                  <div className="flex gap-8 mt-4 pt-3" style={{ borderTop: "1px solid #333" }}>
                    <DataPoint label="Area" value={`${form.squareFootage} SF`} />
                    <DataPoint label="Stories" value={form.stories} />
                    {form.occupancyType && <DataPoint label="Occupancy" value={form.occupancyType.split(" ")[0]} />}
                    {form.lotSize && <DataPoint label="Lot" value={form.lotSize} />}
                  </div>
                </div>

                {/* Brief Content */}
                <div className={`px-8 py-6 ${streamText ? "streaming-cursor" : ""}`}>
                  <div
                    className="brief-content"
                    dangerouslySetInnerHTML={{ __html: marked.parse(displayContent, { async: false }) as string }}
                  />
                </div>

                {/* Disclaimer */}
                {!streamText && completedBrief && (
                  <div className="px-8 py-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      <strong style={{ color: "var(--text-secondary)" }}>Disclaimer:</strong> This
                      report is AI-generated research guidance and does not constitute legal or
                      professional advice. Verify all requirements with the Authority Having
                      Jurisdiction (AHJ) before proceeding with design or permit applications.
                    </p>
                  </div>
                )}

                {/* Branded Footer */}
                <div className="px-8 py-3 flex items-center justify-between" style={{ background: "var(--bg-dark)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center" style={{ border: "1px solid rgba(245,242,238,0.3)" }}>
                      <span className="text-[6px] font-bold" style={{ color: "#f5f2ee" }}>CB</span>
                    </div>
                    <span className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.5)" }}>
                      Generated by CodeBrief
                    </span>
                  </div>
                  <span className="text-[9px]" style={{ color: "rgba(245,242,238,0.25)" }}>
                    codebrief.ai
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}{required && <span style={{ color: "var(--error)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.35)" }}>{label}</p>
      <p className="text-sm font-light" style={{ color: "#f5f2ee" }}>{value}</p>
    </div>
  );
}

function SampleReportPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 transition-colors"
        style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-stone)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-warm)")}
      >
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            See a sample report — Mixed-Use, Chicago, IL
          </span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div style={{ border: "1px solid var(--border-light)", borderTop: "none" }}>
          {/* Sample Header */}
          <div className="px-6 py-4" style={{ background: "var(--bg-dark)" }}>
            <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "var(--accent-light)" }}>
              Sample Code Analysis Report
            </p>
            <h3 className="text-base font-light mt-1" style={{ color: "#f5f2ee" }}>
              Mixed-Use (Residential/Commercial)
            </h3>
            <p className="text-xs" style={{ color: "rgba(245,242,238,0.5)" }}>Chicago, Illinois</p>
            <div className="flex gap-6 mt-3 pt-2" style={{ borderTop: "1px solid #333" }}>
              <div>
                <p className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.35)" }}>Area</p>
                <p className="text-xs font-light" style={{ color: "#f5f2ee" }}>45,000 SF</p>
              </div>
              <div>
                <p className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.35)" }}>Stories</p>
                <p className="text-xs font-light" style={{ color: "#f5f2ee" }}>5</p>
              </div>
              <div>
                <p className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.35)" }}>Occupancy</p>
                <p className="text-xs font-light" style={{ color: "#f5f2ee" }}>R-2 / M</p>
              </div>
            </div>
          </div>

          {/* Sample Tables */}
          <div className="px-6 py-5 brief-content" style={{ background: "#fff" }}>
            <h2>Applicable Codes &amp; Editions</h2>
            <table>
              <thead>
                <tr><th>Code</th><th>Edition</th><th>Local Amendments</th></tr>
              </thead>
              <tbody>
                <tr><td>Chicago Building Code</td><td>Title 14B (2019, based on 2018 IBC)</td><td>Effective August 1, 2020</td></tr>
                <tr><td>Chicago Fire Code</td><td>Title 14F</td><td>Local amendments to IFC</td></tr>
                <tr><td>Chicago Energy Code</td><td>Title 14N (2021 IECC)</td><td>Effective November 1, 2022</td></tr>
                <tr><td>ADA / Illinois Accessibility</td><td>Per Title 14B-11</td><td>Effective December 1, 2019</td></tr>
              </tbody>
            </table>

            <h2>Building Code Analysis</h2>
            <table>
              <thead>
                <tr><th>Requirement</th><th>Code Reference</th><th>Project Compliance</th></tr>
              </thead>
              <tbody>
                <tr><td>Occupancy</td><td>Title 14B Ch. 3</td><td>R-2 (residential) over M (retail) — mixed occupancy</td></tr>
                <tr><td>Construction Type</td><td>Title 14B Ch. 6</td><td>Type I-A or I-B required for 5 stories mixed-use</td></tr>
                <tr><td>Allowable Height</td><td>Table 504.3</td><td>Type I-B: 11 stories / 160 ft — compliant</td></tr>
                <tr><td>Allowable Area</td><td>Table 506.2</td><td>Base 36,000 SF × 3 (sprinkler) = 108,000 SF — compliant</td></tr>
                <tr><td>Sprinkler Required</td><td>§903.2.8</td><td>Yes — R-2 &gt; 3 stories requires NFPA 13</td></tr>
              </tbody>
            </table>

            <h2>Means of Egress</h2>
            <table>
              <thead>
                <tr><th>Requirement</th><th>Code Reference</th><th>Calculation</th></tr>
              </thead>
              <tbody>
                <tr><td>Occupant Load</td><td>Table 1004.5</td><td>Retail: 8,000 SF ÷ 30 = 267 | Residential: 37,000 SF ÷ 200 = 185 | Total: 452</td></tr>
                <tr><td>Number of Exits</td><td>Table 1006.3.1</td><td>452 occupants = minimum 2 exits per floor</td></tr>
                <tr><td>Exit Width</td><td>§1005.1</td><td>452 × 0.2&quot;/person = 90.4&quot; min stair width</td></tr>
                <tr><td>Travel Distance</td><td>Table 1017.2</td><td>R-2 sprinklered: 250 ft max</td></tr>
              </tbody>
            </table>

            <h2>Risk Flags &amp; Additional Requirements</h2>
            <ol>
              <li><strong>Chicago Zoning Bonus</strong> — Affordable housing bonus may increase allowable FAR. Verify with Dept. of Planning.</li>
              <li><strong>Transit-Oriented Development</strong> — If within 600 ft of L station, parking minimums may be reduced or eliminated.</li>
              <li><strong>Flood Zone</strong> — Check FEMA maps for Chicago River/Lake Michigan proximity. May require elevated first floor.</li>
              <li><strong>Historic District</strong> — If in landmark district, design review required. Facade restrictions apply.</li>
              <li><strong>Green Roof/Stormwater</strong> — Chicago Green Roof Initiative may apply to buildings over 10,000 SF. Verify requirements.</li>
            </ol>
          </div>

          {/* Sample Footer */}
          <div className="px-6 py-2.5 flex items-center justify-between" style={{ background: "var(--bg-dark)" }}>
            <span className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.4)" }}>
              Generated by CodeBrief
            </span>
            <span className="text-[9px]" style={{ color: "rgba(245,242,238,0.2)" }}>
              Sample report — actual output includes all 12 sections
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
