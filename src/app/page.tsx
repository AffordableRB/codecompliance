"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-browser";
import { marked } from "marked";

/* ═══════════════════════════════════════════
   TYPES & CONSTANTS
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

const FEATURES = [
  {
    code: "§ Zoning",
    label: "Zoning & Setbacks",
    desc: "Use classification, height limits, setbacks, FAR, lot coverage, and parking minimums for the specific jurisdiction.",
  },
  {
    code: "§ IBC 602",
    label: "Construction Type",
    desc: "Allowable construction types, height and area limits, required fire-resistance ratings per IBC Table 504 and 506.",
  },
  {
    code: "§ IBC 707",
    label: "Fire Separation",
    desc: "Occupancy separation requirements, fire wall and fire barrier ratings, opening protection, and sprinkler tradeoffs.",
  },
  {
    code: "§ IBC 1003",
    label: "Egress",
    desc: "Number of exits, travel distance, corridor width, door hardware, exit discharge, and occupant load calculations.",
  },
  {
    code: "§ ADA / IBC 11",
    label: "Accessibility",
    desc: "Accessible route, parking stall counts, restroom requirements, reach ranges, and signage per ADA Standards.",
  },
  {
    code: "§ IECC",
    label: "Energy Code",
    desc: "Climate zone, envelope requirements, fenestration limits, mechanical and lighting power density thresholds.",
  },
  {
    code: "§ IPC",
    label: "Plumbing Fixtures",
    desc: "Minimum fixture counts by occupancy and occupant load — water closets, lavatories, drinking fountains, service sinks.",
  },
  {
    code: "§ Zoning",
    label: "Parking",
    desc: "Required parking ratios, ADA stall counts, bicycle parking, loading zones, and dimensional standards.",
  },
  {
    code: "⚑ Risk",
    label: "Risk Flags",
    desc: "Potential code conflicts, high-cost compliance items, items requiring AHJ interpretation, and design watch-outs.",
  },
];

const FAQS = [
  {
    q: "How accurate is the analysis?",
    a: "CodeBrief draws on public code databases, jurisdiction-specific amendments, and IBC/IFC/ADA/IECC source text. For most US jurisdictions the analysis is highly reliable as a pre-design reference. Like any AI-generated output, it should be verified with the Authority Having Jurisdiction (AHJ) before permit submission.",
  },
  {
    q: "What codes does it cover?",
    a: "The report covers IBC (International Building Code), IFC (International Fire Code), ADA Standards for Accessible Design, IECC (International Energy Conservation Code), IPC (International Plumbing Code), and local zoning ordinances for 20,000+ US jurisdictions.",
  },
  {
    q: "Does this replace a code consultant?",
    a: "No — and it's not designed to. CodeBrief is pre-design intelligence. It helps architects identify code constraints before schematic design begins, so you can make informed massing and program decisions early. A licensed code consultant or AHJ review remains essential for permit-ready documents.",
  },
  {
    q: "What jurisdictions are supported?",
    a: "CodeBrief covers all 50 US states and over 20,000 municipalities. Simply enter the city and state (or full address) and the system will identify the applicable adopted code edition and local amendments.",
  },
  {
    q: "How is the data sourced?",
    a: "The system searches public code adoption databases, municipal websites, and official code text at the time of each request. It does not rely on a static snapshot — each analysis reflects current publicly available information for the specified jurisdiction.",
  },
];

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "",
    briefs: "2 briefs / month",
    features: ["Full code analysis report", "IBC / ADA / IECC citations", "PDF export"],
    cta: "Get started",
    highlight: false,
  },
  {
    key: "solo",
    name: "Solo",
    price: "$49",
    period: "/mo",
    briefs: "15 briefs / month",
    features: ["Everything in Free", "Priority generation", "Brief history & archive"],
    cta: "Start Solo",
    highlight: false,
  },
  {
    key: "firm",
    name: "Firm",
    price: "$99",
    period: "/mo",
    briefs: "Unlimited briefs",
    features: ["Everything in Solo", "Up to 5 users", "Shared brief library"],
    cta: "Start Firm",
    highlight: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    briefs: "Unlimited briefs",
    features: ["Everything in Firm", "Unlimited users", "Priority support & SLA"],
    cta: "Contact us",
    highlight: false,
  },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<ProjectInput>(initialForm);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamText, setStreamText] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const briefRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const update = (field: keyof ProjectInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canSubmit =
    form.buildingType && form.location && form.squareFootage && form.stories;

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ══════════════════════════════════════
          NAVIGATION
          ══════════════════════════════════════ */}
      <nav
        className="no-print sticky top-0 z-50"
        style={{
          background: "rgba(235,232,226,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "0 var(--container-px)", height: "56px" }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            <div
              className="flex items-center justify-center"
              style={{ width: "26px", height: "26px", border: "1px solid var(--text-primary)" }}
            >
              <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.05em" }}>
                CB
              </span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>
              CodeBrief
            </span>
          </a>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "City Codes", href: "/codes" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{ fontSize: "11px", letterSpacing: "0.04em", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Auth */}
          <div className="flex items-center gap-5">
            {!authLoading &&
              (user ? (
                <a
                  href="/dashboard"
                  style={{ fontSize: "11px", letterSpacing: "0.04em", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Dashboard
                </a>
              ) : (
                <a
                  href="/login"
                  style={{ fontSize: "11px", letterSpacing: "0.04em", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Sign In
                </a>
              ))}
            <button
              onClick={scrollToForm}
              className="btn-primary no-print"
              style={{ padding: "0.5rem 1.25rem", fontSize: "10px" }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ══════════════════════════════════════
            MARKETING SECTIONS (hidden when report active)
            ══════════════════════════════════════ */}
        {!displayText && !loading && (
          <>

            {/* ── HERO ── */}
            <section className="no-print hero-grid" style={{ minHeight: "88vh", display: "flex", alignItems: "center", position: "relative" }}>
              <div
                style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "5rem var(--container-px)", width: "100%", position: "relative", zIndex: 1 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                  {/* Left — Copy */}
                  <div>
                    <h1 className="display-headline mb-6">
                      EVERY APPLICABLE{" "}<span className="display-headline-accent">CODE.</span>
                      <br />
                      ONE{" "}<span className="display-headline-accent">REPORT.</span>
                    </h1>
                    <p
                      className="mb-8"
                      style={{
                        fontSize: "1.0625rem",
                        lineHeight: 1.65,
                        color: "var(--text-secondary)",
                        fontWeight: 400,
                        maxWidth: "480px",
                      }}
                    >
                      The complete code analysis for your project — including the
                      requirements you didn&apos;t know to search for.
                    </p>
                    <div className="flex items-center gap-5 flex-wrap">
                      <button onClick={scrollToForm} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                        GET STARTED <span style={{ fontSize: "1rem" }}>→</span>
                      </button>
                    </div>

                    {/* Trust strip — Civils.ai style: big numbers, dividers */}
                    <div
                      className="flex items-start gap-0 mt-12 pt-0"
                      style={{ borderTop: "none" }}
                    >
                      {[
                        { value: "20,000", suffix: "+", label: "US JURISDICTIONS" },
                        { value: "12", suffix: "", label: "CODE DOMAINS" },
                        { value: "60", suffix: "sec", label: "AVERAGE DELIVERY" },
                      ].map((s, i) => (
                        <div
                          key={s.label}
                          style={{
                            paddingRight: i < 2 ? "2.5rem" : "0",
                            marginRight: i < 2 ? "2.5rem" : "0",
                            borderRight: i < 2 ? "1px solid var(--border-medium)" : "none",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-sans), 'Inter', sans-serif",
                              fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                              lineHeight: 1,
                              fontWeight: 900,
                              letterSpacing: "-0.03em",
                              color: "var(--text-primary)",
                              marginBottom: "4px",
                            }}
                          >
                            {s.value}<span style={{ fontSize: "60%", fontWeight: 700 }}>{s.suffix}</span>
                          </p>
                          <p style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — Mock Report Card (light, floating) */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border-light)",
                      boxShadow: "var(--shadow-xl)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Document header */}
                    <div
                      style={{
                        background: "#1c1a17",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        padding: "0.875rem 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div style={{ width: "16px", height: "16px", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "6px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>CB</span>
                        </div>
                        <span style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Code Analysis Report</span>
                      </div>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>Mixed-Use · Austin, TX</span>
                    </div>

                    {/* Report body preview */}
                    <div style={{ padding: "1.25rem" }}>
                      {/* Section: Zoning */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--bg-warm)", padding: "2px 6px", border: "1px solid var(--border-light)" }}>§ Zoning</span>
                          <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-primary)" }}>Zoning &amp; Setbacks</span>
                        </div>
                        <div style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)", padding: "0.625rem 0.75rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem" }}>
                            {[
                              ["Use Classification", "MU-3 Mixed Use"],
                              ["Max Height", "65 ft / 5 stories"],
                              ["Front Setback", "0 ft (build-to line)"],
                              ["FAR", "3.5 : 1"],
                            ].map(([k, v]) => (
                              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "3px" }}>
                                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{k}</span>
                                <span style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-primary)" }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Section: Construction Type */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--bg-warm)", padding: "2px 6px", border: "1px solid var(--border-light)" }}>§ IBC 602</span>
                          <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-primary)" }}>Construction Type</span>
                        </div>
                        <div style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)", padding: "0.625rem 0.75rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem" }}>
                            {[
                              ["Allowable Types", "IA, IB, IIA"],
                              ["Max Height (IA)", "Unlimited"],
                              ["Max Area / Floor", "Unlimited"],
                              ["Sprinkler Required", "Yes — NFPA 13"],
                            ].map(([k, v]) => (
                              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "3px" }}>
                                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{k}</span>
                                <span style={{ fontSize: "9px", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Confidence badges row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                        <span style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Confidence:</span>
                        <span style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#166534", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "1px 6px" }}>14 Confirmed</span>
                        <span style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", padding: "1px 6px" }}>3 Verify</span>
                        <span style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#991b1b", background: "#fee2e2", border: "1px solid #fecaca", padding: "1px 6px" }}>1 Gap</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section
              id="how-it-works"
              className="no-print dark-section"
            >
              <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "var(--section-py) var(--container-px)" }}>
                <div style={{ maxWidth: "560px", marginBottom: "4rem" }}>
                  <p className="label-caps-dark mb-4">Process</p>
                  <h2 className="section-headline-dark">
                    From project parameters<br />to code analysis in 60 seconds
                  </h2>
                </div>

                {/* Three steps — full-width alternating panels */}
                <div>
                  {[
                    {
                      n: "01",
                      title: "Enter project parameters",
                      desc: "Building type, location, gross area, stories, and occupancy. Optional fields — occupant load, lot size, project notes — improve accuracy. The form takes under a minute to fill.",
                      detail: "Required: Building type · Location · Gross area · Stories",
                    },
                    {
                      n: "02",
                      title: "We search public code databases",
                      desc: "The system queries jurisdiction-specific code adoptions, local amendments, and IBC/IFC/ADA/IECC source text in real time. No cached snapshots — every analysis reflects current publicly available information.",
                      detail: "Sources: IBC · IFC · ADA · IECC · IPC · Local amendments",
                    },
                    {
                      n: "03",
                      title: "Receive your code analysis report",
                      desc: "A structured document with tabular requirements, section citations, calculated values, and risk flags. Confidence tiers (Confirmed / Verify / Gap) on every finding. Export as PDF.",
                      detail: "Output: 12 code domains · Confidence tiers · PDF export",
                    },
                  ].map((step, i) => (
                    <div
                      key={step.n}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr",
                        gap: "0",
                        borderTop: "1px solid var(--border-dark)",
                        padding: "2.5rem 0",
                      }}
                    >
                      <div style={{ paddingTop: "2px" }}>
                        <span
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "2rem",
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                            color: "rgba(255,255,255,0.12)",
                          }}
                        >
                          {step.n}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
                        <div>
                          <h3
                            style={{
                              fontSize: "1rem",
                              fontWeight: 500,
                              color: "var(--text-inverse)",
                              marginBottom: "0.75rem",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {step.title}
                          </h3>
                          <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(240,234,216,0.45)", fontWeight: 300 }}>
                            {step.desc}
                          </p>
                        </div>
                        <div style={{ paddingTop: "2px" }}>
                          <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-mono), monospace", lineHeight: 1.8 }}>
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: "3rem", borderTop: "1px solid var(--border-dark)" }}>
                  <button onClick={scrollToForm} className="btn-primary-light">
                    Try it now — free
                  </button>
                </div>
              </div>
            </section>

            {/* ── FEATURE SHOWCASE PANELS ── */}
            <section id="features" className="no-print dark-section">

              {/* Panel 1: Jurisdiction Intelligence */}
              <div className="feature-panel">
                <div className="feature-panel-content">
                  <p className="label-caps-dark mb-5">Jurisdiction Intelligence</p>
                  <h2 className="section-headline-dark mb-5">
                    Every city. Every amendment.
                  </h2>
                  <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(240,234,216,0.5)", fontWeight: 300, marginBottom: "2rem", maxWidth: "420px" }}>
                    CodeBrief covers 20,000+ US jurisdictions. When a city adopts
                    a local amendment to the IBC, we know. When a county has its
                    own zoning overlay, it&apos;s in the report.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                      "State-adopted code edition identified automatically",
                      "Local amendments and overlays included",
                      "AHJ-specific requirements flagged",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span style={{ color: "rgba(255,255,255,0.2)", marginTop: "1px", flexShrink: 0 }}>—</span>
                        <span style={{ fontSize: "13px", color: "rgba(240,234,216,0.55)", fontWeight: 300 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="feature-panel-visual">
                  {/* Jurisdiction map visual */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ width: "100%", maxWidth: "360px" }}>
                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.5rem" }}>Jurisdiction Coverage</p>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {["CA", "TX", "NY", "FL", "IL", "WA", "CO", "GA", "MA", "AZ", "OR", "NC"].map((s) => (
                            <span key={s} style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "3px 8px" }}>{s}</span>
                          ))}
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", padding: "3px 8px" }}>+38 more</span>
                        </div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "1rem" }}>
                        <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.75rem" }}>Sample — Austin, TX</p>
                        {[
                          ["Adopted Code", "IBC 2021"],
                          ["Local Amendments", "Austin Amendments 2021"],
                          ["Energy Code", "IECC 2021 w/ TX Amendments"],
                          ["Fire Code", "IFC 2021"],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{k}</span>
                            <span style={{ fontSize: "9px", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: Confidence Tiers */}
              <div className="feature-panel reverse">
                <div className="feature-panel-content">
                  <p className="label-caps-dark mb-5">Confidence Tiers</p>
                  <h2 className="section-headline-dark mb-5">
                    Know what you know.
                  </h2>
                  <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(240,234,216,0.5)", fontWeight: 300, marginBottom: "2rem", maxWidth: "420px" }}>
                    Every finding is tagged with a confidence tier. Confirmed
                    findings are sourced directly from public code text. Verify
                    items need AHJ confirmation. Gaps flag missing data.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    {[
                      { color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)", label: "Confirmed", desc: "Sourced directly from public code text" },
                      { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", label: "Verify", desc: "Likely correct — confirm with AHJ" },
                      { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", label: "Gap", desc: "Data unavailable — requires direct research" },
                    ].map((tier) => (
                      <div key={tier.label} className="flex items-center gap-4">
                        <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: tier.color, background: tier.bg, border: `1px solid ${tier.border}`, padding: "3px 10px", flexShrink: 0, minWidth: "80px", textAlign: "center" }}>
                          {tier.label}
                        </span>
                        <span style={{ fontSize: "12px", color: "rgba(240,234,216,0.45)", fontWeight: 300 }}>{tier.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="feature-panel-visual">
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ width: "100%", maxWidth: "360px" }}>
                      <p style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.75rem" }}>Egress Analysis — Sample</p>
                      {[
                        { tier: "CONFIRMED", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.15)", text: "Minimum 2 exits required per IBC §1006.3.3 (occupant load 312 > 49)" },
                        { tier: "CONFIRMED", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.15)", text: "Exit access travel distance ≤ 250 ft (sprinklered B occupancy, IBC Table 1017.2)" },
                        { tier: "VERIFY", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)", text: "Corridor width 44 in. min — verify Austin local amendment §1020.2" },
                        { tier: "GAP", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.15)", text: "Roof access requirements — AHJ interpretation required for this use type" },
                      ].map((item, i) => (
                        <div key={i} style={{ background: item.bg, border: `1px solid ${item.border}`, padding: "0.625rem 0.75rem", marginBottom: "0.5rem", display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                          <span style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: item.color, flexShrink: 0, marginTop: "2px" }}>{item.tier}</span>
                          <span style={{ fontSize: "10px", lineHeight: 1.5, color: "rgba(255,255,255,0.5)" }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 3: Report Coverage */}
              <div className="feature-panel">
                <div className="feature-panel-content">
                  <p className="label-caps-dark mb-5">Report Coverage</p>
                  <h2 className="section-headline-dark mb-5">
                    Twelve code domains.<br />One document.
                  </h2>
                  <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(240,234,216,0.5)", fontWeight: 300, marginBottom: "2rem", maxWidth: "420px" }}>
                    Every analysis covers zoning, construction type, fire
                    separation, egress, accessibility, energy, plumbing, parking,
                    and risk flags. Each section includes the applicable code
                    reference and the calculated requirement for your project.
                  </p>
                  <button onClick={scrollToForm} className="btn-ghost">
                    See a sample report
                  </button>
                </div>
                <div className="feature-panel-visual">
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ width: "100%", maxWidth: "360px" }}>
                      <p style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.75rem" }}>Report Contents</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
                        {FEATURES.map((f) => (
                          <div key={f.label} style={{ background: "var(--bg-dark-2)", padding: "0.75rem" }}>
                            <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-light)", marginBottom: "3px" }}>{f.code}</p>
                            <p style={{ fontSize: "10px", fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>{f.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* ── STATS STRIP ── */}
            <section
              className="no-print"
              style={{
                background: "var(--bg-base)",
                borderTop: "1px solid var(--border-light)",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "4rem var(--container-px)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {[
                    { value: "20,000+", label: "US Jurisdictions Covered", sub: "All 50 states, 20,000+ municipalities" },
                    { value: "12", label: "Code Domains Per Report", sub: "Zoning · IBC · IFC · ADA · IECC · IPC" },
                    { value: "60 sec", label: "Average Delivery Time", sub: "From form submission to full report" },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: "2rem 2.5rem",
                        borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                        textAlign: i === 1 ? "center" : i === 2 ? "right" : "left",
                      }}
                    >
                      <p className="stat-number" style={{ marginBottom: "0.5rem" }}>{stat.value}</p>
                      <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-primary)", marginBottom: "0.25rem" }}>{stat.label}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 300 }}>{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section
              className="no-print"
              style={{ background: "var(--bg-base)" }}
            >
              <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "var(--section-py) var(--container-px)" }}>
                <div style={{ maxWidth: "560px", marginBottom: "4rem" }}>
                  <p className="label-caps mb-4">Early Access</p>
                  <h2 className="section-headline">
                    Built for architects who<br />move fast in pre-design
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {[
                    {
                      quote: "This is exactly what I needed for schematic design. I used to spend half a day pulling code requirements — now it takes minutes.",
                      name: "Principal Architect",
                      firm: "Architecture Firm, San Francisco",
                    },
                    {
                      quote: "The confidence tiers are a game changer. I know exactly which items need AHJ confirmation versus which are solid. That's real signal.",
                      name: "Project Manager",
                      firm: "Architecture Firm, Austin",
                    },
                    {
                      quote: "The IBC citations alone save us hours per project. Having the section numbers right there in the report is genuinely useful.",
                      name: "Associate Architect",
                      firm: "Architecture Firm, New York",
                    },
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "2.5rem",
                        borderTop: "2px solid var(--border-light)",
                        borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.75,
                          color: "var(--text-secondary)",
                          fontWeight: 300,
                          fontStyle: "italic",
                          marginBottom: "1.5rem",
                        }}
                      >
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{t.name}</p>
                        <p style={{ fontSize: "10px", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{t.firm}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── PRICING ── */}
            <section
              id="pricing"
              className="no-print"
              style={{
                background: "var(--bg-warm)",
                borderTop: "1px solid var(--border-light)",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "var(--section-py) var(--container-px)" }}>
                <div style={{ maxWidth: "560px", marginBottom: "4rem" }}>
                  <p className="label-caps mb-4">Pricing</p>
                  <h2 className="section-headline">Simple, transparent pricing</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 300, marginTop: "0.75rem" }}>
                    No setup fees. No contracts. Cancel anytime.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                  {PLANS.map((plan, i) => (
                    <div
                      key={plan.key}
                      style={{
                        padding: "2rem 1.75rem",
                        background: plan.highlight ? "var(--bg-dark)" : "transparent",
                        borderTop: plan.highlight ? "2px solid var(--bg-dark)" : "2px solid var(--border-light)",
                        borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                        position: "relative",
                      }}
                    >
                      {plan.highlight && (
                        <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent-light)", marginBottom: "1rem" }}>
                          Most Popular
                        </p>
                      )}
                      <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: plan.highlight ? "rgba(240,234,216,0.4)" : "var(--text-muted)", marginBottom: "0.5rem" }}>
                        {plan.name}
                      </p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "2.25rem",
                            lineHeight: 1,
                            letterSpacing: "-0.02em",
                            color: plan.highlight ? "var(--text-inverse)" : "var(--text-primary)",
                          }}
                        >
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span style={{ fontSize: "11px", color: plan.highlight ? "rgba(240,234,216,0.35)" : "var(--text-muted)" }}>
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "11px", color: plan.highlight ? "rgba(240,234,216,0.4)" : "var(--text-secondary)", marginBottom: "1.5rem" }}>
                        {plan.briefs}
                      </p>
                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2" style={{ fontSize: "12px", color: plan.highlight ? "rgba(240,234,216,0.55)" : "var(--text-secondary)" }}>
                            <span style={{ color: plan.highlight ? "rgba(240,234,216,0.25)" : "var(--accent)", flexShrink: 0 }}>—</span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                      <a
                        href="/login"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "0.625rem",
                          textAlign: "center",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                          transition: "background 0.15s, color 0.15s",
                          ...(plan.highlight
                            ? { background: "var(--text-inverse)", color: "var(--bg-dark)" }
                            : { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-medium)" }),
                        }}
                        onMouseEnter={(e) => {
                          if (plan.highlight) {
                            e.currentTarget.style.background = "var(--bg-stone)";
                          } else {
                            e.currentTarget.style.background = "var(--bg-stone)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (plan.highlight) {
                            e.currentTarget.style.background = "var(--text-inverse)";
                          } else {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        {plan.cta}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section
              id="faq"
              className="no-print"
              style={{ background: "var(--bg-base)" }}
            >
              <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "var(--section-py) var(--container-px)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem" }}>
                  <div>
                    <p className="label-caps mb-4">FAQ</p>
                    <h2 className="section-headline">
                      Frequently asked questions
                    </h2>
                  </div>
                  <div>
                    {FAQS.map((faq, i) => (
                      <div
                        key={i}
                        style={{ borderTop: "1px solid var(--border-light)" }}
                      >
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between"
                          style={{ padding: "1.25rem 0", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                        >
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", paddingRight: "2rem" }}>
                            {faq.q}
                          </span>
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: 300,
                              color: "var(--text-muted)",
                              flexShrink: 0,
                              transition: "transform 0.2s",
                              transform: openFaq === i ? "rotate(45deg)" : "none",
                              display: "inline-block",
                            }}
                          >
                            +
                          </span>
                        </button>
                        {openFaq === i && (
                          <div style={{ paddingBottom: "1.25rem" }}>
                            <p style={{ fontSize: "13px", lineHeight: 1.75, color: "var(--text-secondary)", fontWeight: 300 }}>
                              {faq.a}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid var(--border-light)" }} />
                  </div>
                </div>
              </div>
            </section>

            {/* ── BOTTOM CTA ── */}
            <section
              className="no-print dark-section"
              style={{ borderTop: "1px solid var(--border-dark)" }}
            >
              <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "var(--section-py) var(--container-px)", textAlign: "center" }}>
                <p className="label-caps-dark mb-5">For Architects</p>
                <h2
                  className="section-headline-dark"
                  style={{ marginBottom: "1.25rem", maxWidth: "560px", margin: "0 auto 1.25rem" }}
                >
                  Start your first code analysis
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(240,234,216,0.4)", fontWeight: 300, marginBottom: "2.5rem", maxWidth: "380px", margin: "0 auto 2.5rem" }}>
                  Free tier includes 2 briefs per month. No credit card required.
                </p>
                <button onClick={scrollToForm} className="btn-primary-light">
                  Generate a Brief
                </button>
              </div>
            </section>

          </>
        )}

        {/* ══════════════════════════════════════
            FORM + REPORT SECTION
            ══════════════════════════════════════ */}
        <section
          id="generate"
          ref={formRef}
          style={{
            background: displayText || loading ? "var(--bg-base)" : "var(--bg-warm)",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "4rem var(--container-px)" }}>

            {/* ── Input Form ── */}
            {!brief && (
              <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                {!displayText && !loading && (
                  <div style={{ marginBottom: "2.5rem" }}>
                    <p className="label-caps mb-3">Generate</p>
                    <h2 className="section-headline" style={{ marginBottom: "0.75rem" }}>
                      Start your code analysis
                    </h2>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 300 }}>
                      Enter your project parameters below. Required fields take
                      60 seconds to fill. Optional fields improve accuracy.
                    </p>
                  </div>
                )}

                <form onSubmit={generateBrief}>
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border-medium)",
                    }}
                  >
                    {/* Form Header */}
                    <div
                      className="flex items-center gap-3"
                      style={{
                        background: "var(--bg-dark)",
                        borderBottom: "1px solid var(--border-dark)",
                        padding: "0.875rem 1.75rem",
                      }}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{ width: "18px", height: "18px", border: "1px solid rgba(255,255,255,0.15)" }}
                      >
                        <span style={{ fontSize: "7px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>CB</span>
                      </div>
                      <h3 style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                        Project Information
                      </h3>
                    </div>

                    <div style={{ padding: "1.75rem" }}>
                      {/* Required */}
                      <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
                        Required
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" style={{ marginBottom: "1.75rem" }}>
                        <InputField
                          label="Building Type"
                          required
                          input={
                            <select
                              value={form.buildingType}
                              onChange={(e) => update("buildingType", e.target.value)}
                              className="form-input"
                              required
                            >
                              <option value="">Select type...</option>
                              {BUILDING_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
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
                              onChange={(e) => update("squareFootage", e.target.value)}
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

                      {/* Optional */}
                      <div
                        style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem", marginBottom: "1.5rem" }}
                      >
                        <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
                          Optional — improves accuracy
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                          <InputField
                            label="Occupancy Group"
                            input={
                              <select
                                value={form.occupancyType}
                                onChange={(e) => update("occupancyType", e.target.value)}
                                className="form-input"
                              >
                                <option value="">Auto-classify</option>
                                {OCCUPANCY_TYPES.map((t) => (
                                  <option key={t} value={t}>{t}</option>
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
                                onChange={(e) => update("occupantLoad", e.target.value)}
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
                      <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem" }}>
                        <InputField
                          label="Project Notes"
                          input={
                            <textarea
                              value={form.additionalNotes}
                              onChange={(e) => update("additionalNotes", e.target.value)}
                              rows={3}
                              placeholder="Renovation vs. new construction, specific concerns, use details, known variances..."
                              className="form-input"
                            />
                          }
                        />
                      </div>

                      {/* Error */}
                      {error && (
                        <div
                          className="flex items-start gap-2.5"
                          style={{
                            marginTop: "1.25rem",
                            padding: "0.875rem",
                            background: "#fef2f2",
                            border: "1px solid #fca5a5",
                            color: "var(--error)",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ flexShrink: 0, marginTop: "1px" }}>—</span>
                          {error}
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <div
                      className="flex items-center justify-between"
                      style={{
                        padding: "1rem 1.75rem",
                        background: "var(--bg-warm)",
                        borderTop: "1px solid var(--border-light)",
                      }}
                    >
                      <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        Covers zoning · IBC · IFC · ADA · IECC · IPC · local amendments
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={resetForm}
                          style={{ padding: "0.5rem 1rem", fontSize: "11px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                          Clear
                        </button>
                        <button
                          type="submit"
                          disabled={!canSubmit || loading}
                          className="btn-primary"
                          style={{ padding: "0.625rem 1.5rem", fontSize: "10px", opacity: (!canSubmit || loading) ? 0.4 : 1, cursor: (!canSubmit || loading) ? "not-allowed" : "pointer" }}
                        >
                          {loading ? "Generating..." : "Generate Analysis"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* ── Loading State ── */}
            {loading && !streamText && (
              <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                <div
                  style={{
                    padding: "4rem",
                    textAlign: "center",
                    background: "#ffffff",
                    border: "1px solid var(--border-medium)",
                  }}
                >
                  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        border: "1px solid var(--border-medium)",
                        borderTopColor: "var(--text-primary)",
                        animation: "spin 1s linear infinite",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    Searching jurisdiction codes...
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 300 }}>
                    Querying public code databases and synthesizing your analysis. Typically 30–60 seconds.
                  </p>
                </div>
              </div>
            )}

            {/* ── Report Output ── */}
            {displayText && (
              <div ref={briefRef} style={{ maxWidth: "860px", margin: "0 auto" }}>
                {/* Toolbar */}
                <div className="flex items-center justify-between no-print" style={{ marginBottom: "1.25rem" }}>
                  <div className="flex items-center gap-3">
                    {loading && (
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "1px solid var(--border-medium)",
                          borderTopColor: "var(--text-primary)",
                          animation: "spin 1s linear infinite",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: loading ? "var(--accent)" : "var(--text-muted)" }}>
                      {loading ? "Generating report..." : "Code Analysis Report"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "9px",
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-medium)",
                        background: "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-warm)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={resetForm}
                      className="btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "9px" }}
                    >
                      New Analysis
                    </button>
                  </div>
                </div>

                {/* The Document */}
                <div
                  className="report-document"
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-medium)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  {/* Document Header */}
                  <div style={{ padding: "1.75rem 2rem", background: "var(--bg-dark)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent-light)", marginBottom: "0.5rem" }}>
                          Code Analysis Report
                        </p>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 300, letterSpacing: "-0.01em", color: "var(--text-inverse)", marginBottom: "0.25rem" }}>
                          {form.buildingType}
                        </h2>
                        <p style={{ fontSize: "13px", color: "rgba(240,234,216,0.4)" }}>
                          {form.location}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div className="flex items-center justify-end gap-2" style={{ marginBottom: "0.5rem" }}>
                          <div style={{ width: "18px", height: "18px", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "6px", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>CB</span>
                          </div>
                          <span style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>CodeBrief</span>
                        </div>
                        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>
                          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Data Strip */}
                    <div
                      className="flex flex-wrap gap-8"
                      style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <DataPoint label="Gross Area" value={`${form.squareFootage} SF`} />
                      <DataPoint label="Stories" value={form.stories} />
                      {form.occupancyType && (
                        <DataPoint label="Occupancy" value={form.occupancyType.split(" ")[0]} />
                      )}
                      {form.occupantLoad && (
                        <DataPoint label="Occupant Load" value={form.occupantLoad} />
                      )}
                      {form.lotSize && (
                        <DataPoint label="Lot Size" value={form.lotSize} />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "2rem" }}>
                    <div
                      className={`brief-content${loading ? " streaming-cursor" : ""}`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(displayText) }}
                    />
                  </div>

                  {/* Disclaimer */}
                  <div
                    style={{
                      margin: "0 2rem 1.5rem",
                      padding: "1rem 1.25rem",
                      background: "var(--bg-warm)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <p style={{ fontSize: "10px", lineHeight: 1.7, color: "var(--text-muted)" }}>
                      <strong style={{ color: "var(--text-secondary)" }}>Disclaimer:</strong>{" "}
                      This report is AI-generated research guidance and does not
                      constitute legal or professional advice. Building codes are
                      life-safety regulations — verify all requirements with the
                      Authority Having Jurisdiction (AHJ) before proceeding with
                      design or permit applications.
                    </p>
                  </div>

                  {/* Branded Footer */}
                  <div
                    className="flex items-center justify-between"
                    style={{ padding: "0.875rem 2rem", background: "var(--bg-dark)", borderTop: "1px solid var(--border-dark)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div style={{ width: "14px", height: "14px", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "5px", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>CB</span>
                      </div>
                      <span style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Generated by CodeBrief</span>
                    </div>
                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.15)" }}>codebrief.ai</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer
        className="no-print"
        style={{
          background: "var(--bg-warm)",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "3rem var(--container-px)" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border-light)" }}
          >
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.75rem" }}>
                <div style={{ width: "20px", height: "20px", border: "1px solid var(--border-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "7px", fontWeight: 700, color: "var(--text-muted)" }}>CB</span>
                </div>
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>CodeBrief</span>
              </div>
              <p style={{ fontSize: "12px", lineHeight: 1.7, color: "var(--text-muted)", fontWeight: 300, maxWidth: "220px" }}>
                Pre-design code intelligence for architects. Every applicable code, one report.
              </p>
            </div>
            <div>
              <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.875rem" }}>Product</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[["/#how-it-works","How it works"],["/#features","Features"],["/#pricing","Pricing"],["/#generate","Generate a Brief"]].map(([href,label]) => (
                  <a key={label} href={href} style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.875rem" }}>Resources</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[["/codes","City Code Directory"],["/#faq","FAQ"],["/blog","Blog"]].map(([href,label]) => (
                  <a key={label} href={href} style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.875rem" }}>Company</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[["/pricing","Pricing"],["/privacy","Privacy Policy"],["/terms","Terms of Service"]].map(([href,label]) => (
                  <a key={label} href={href} style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>{label}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>&copy; {new Date().getFullYear()} CodeBrief. All rights reserved.</span>
            <span style={{ fontSize: "11px", color: "var(--border-medium)" }}>Pre-design code intelligence for architects</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

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
        style={{
          display: "block",
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "6px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#8b1a1a", marginLeft: "3px" }}>*</span>
        )}
      </label>
      {input}
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "7px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,234,216,0.3)", marginBottom: "2px" }}>
        {label}
      </p>
      <p style={{ fontSize: "13px", fontWeight: 300, color: "var(--text-inverse)", letterSpacing: "-0.01em" }}>
        {value}
      </p>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string;
}
