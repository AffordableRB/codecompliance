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
          background: "#f7f3ec",
          borderBottom: "1px solid #ddd5c8",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div
              className="w-7 h-7 flex items-center justify-center"
              style={{ border: "1px solid #1c1a17" }}
            >
              <span
                className="text-[10px] font-bold tracking-tight"
                style={{ color: "#1c1a17" }}
              >
                CB
              </span>
            </div>
            <span
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: "#1c1a17", letterSpacing: "0.12em" }}
            >
              CodeBrief
            </span>
          </a>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {["How it works", "Features", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs tracking-wide transition-colors"
                style={{ color: "#8a8078" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#1c1a17")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#8a8078")
                }
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {!authLoading &&
              (user ? (
                <a
                  href="/dashboard"
                  className="text-xs tracking-wide transition-colors"
                  style={{ color: "#8a8078" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#1c1a17")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#8a8078")
                  }
                >
                  Dashboard
                </a>
              ) : (
                <a
                  href="/login"
                  className="text-xs tracking-wide transition-colors"
                  style={{ color: "#8a8078" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#1c1a17")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#8a8078")
                  }
                >
                  Sign In
                </a>
              ))}
            <button
              onClick={scrollToForm}
              className="px-4 py-2 text-xs font-medium tracking-widest uppercase transition-colors no-print"
              style={{
                background: "#1c1a17",
                color: "#f7f3ec",
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#333")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#1c1a17")
              }
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ══════════════════════════════════════
            HERO
            ══════════════════════════════════════ */}
        {!displayText && !loading && (
          <>
            <section
              className="no-print"
              style={{ background: "#111111" }}
            >
              <div className="max-w-7xl mx-auto px-8 py-20 md:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  {/* Left — Copy */}
                  <div>
                    <p className="section-label mb-5">Pre-Design Intelligence</p>
                    <h1
                      className="text-4xl md:text-5xl leading-tight mb-6"
                      style={{
                        color: "#f5f2ee",
                        fontFamily: "var(--font-serif-display), Georgia, serif",
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.1,
                      }}
                    >
                      Every applicable code.
                      <br />
                      One report.
                    </h1>
                    <p
                      className="text-base leading-relaxed mb-8 max-w-lg"
                      style={{ color: "rgba(245,242,238,0.55)", fontWeight: 300 }}
                    >
                      The complete code analysis for your project. Including the
                      requirements you didn&apos;t know to search for.
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={scrollToForm}
                        className="px-6 py-3 text-xs font-medium tracking-widest uppercase transition-colors"
                        style={{
                          background: "#f5f2ee",
                          color: "#111111",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#e5e0d8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#f5f2ee")
                        }
                      >
                        Generate a Brief
                      </button>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(245,242,238,0.3)" }}
                      >
                        Free — no credit card required
                      </span>
                    </div>
                  </div>

                  {/* Right — Product demo placeholder */}
                  <div
                    className="relative"
                    style={{
                      border: "1px solid rgba(245,242,238,0.1)",
                      background: "rgba(245,242,238,0.03)",
                      aspectRatio: "16/10",
                    }}
                  >
                    {/* Placeholder for product demo GIF/recording */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{ border: "1px solid rgba(245,242,238,0.15)" }}
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M7 4l9 6-9 6V4z"
                            stroke="rgba(245,242,238,0.3)"
                            strokeWidth="1"
                            fill="rgba(245,242,238,0.1)"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-[10px] tracking-widest uppercase"
                        style={{ color: "rgba(245,242,238,0.2)" }}
                      >
                        Product demo — coming soon
                      </p>
                    </div>

                    {/* Corner decorations */}
                    <div
                      className="absolute top-0 left-0 w-4 h-4"
                      style={{ borderTop: "1px solid rgba(245,242,238,0.25)", borderLeft: "1px solid rgba(245,242,238,0.25)" }}
                    />
                    <div
                      className="absolute top-0 right-0 w-4 h-4"
                      style={{ borderTop: "1px solid rgba(245,242,238,0.25)", borderRight: "1px solid rgba(245,242,238,0.25)" }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-4 h-4"
                      style={{ borderBottom: "1px solid rgba(245,242,238,0.25)", borderLeft: "1px solid rgba(245,242,238,0.25)" }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4"
                      style={{ borderBottom: "1px solid rgba(245,242,238,0.25)", borderRight: "1px solid rgba(245,242,238,0.25)" }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════
                STATS STRIP
                ══════════════════════════════════════ */}
            <section
              className="no-print"
              style={{
                background: "var(--bg-warm)",
                borderBottom: "1px solid var(--border-light)",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-3 divide-x"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  {[
                    { value: "20,000+", label: "US Jurisdictions" },
                    { value: "12", label: "Code Domains Analyzed" },
                    { value: "60 sec", label: "Delivery" },
                  ].map((stat) => (
                    <div key={stat.label} className="px-8 first:pl-0 last:pr-0 text-center">
                      <p
                        className="text-2xl font-light tracking-tight mb-1"
                        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                      >
                        {stat.value}
                      </p>
                      <p className="section-label">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════
                HOW IT WORKS
                ══════════════════════════════════════ */}
            <section
              id="how-it-works"
              className="no-print"
              style={{ background: "var(--bg-base)" }}
            >
              <div className="max-w-7xl mx-auto px-8 py-20">
                <div className="max-w-xl mb-14">
                  <p className="section-label mb-3">Process</p>
                  <h2 className="section-title">How it works</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {[
                    {
                      n: "01",
                      title: "Enter project parameters",
                      desc: "Building type, location, gross area, stories, and occupancy. Optional: occupant load, lot size, project notes.",
                    },
                    {
                      n: "02",
                      title: "We search public code databases",
                      desc: "The system queries jurisdiction-specific code adoptions, local amendments, and IBC/IFC/ADA/IECC source text in real time.",
                    },
                    {
                      n: "03",
                      title: "Get your code analysis report",
                      desc: "A structured document with tabular requirements, section citations, calculations, and risk flags — ready to export as PDF.",
                    },
                  ].map((step, i) => (
                    <div
                      key={step.n}
                      className="p-8"
                      style={{
                        borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                        borderTop: "2px solid var(--text-primary)",
                      }}
                    >
                      <p
                        className="text-3xl font-light mb-6"
                        style={{ color: "var(--border-medium)", letterSpacing: "-0.02em" }}
                      >
                        {step.n}
                      </p>
                      <h3
                        className="text-base font-medium mb-3"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════
                FEATURES
                ══════════════════════════════════════ */}
            <section
              id="features"
              className="no-print"
              style={{
                background: "var(--bg-warm)",
                borderTop: "1px solid var(--border-light)",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <div className="max-w-7xl mx-auto px-8 py-20">
                <div className="max-w-xl mb-14">
                  <p className="section-label mb-3">Report Coverage</p>
                  <h2 className="section-title">
                    Everything your report covers
                  </h2>
                  <p
                    className="text-sm leading-relaxed mt-4"
                    style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                  >
                    Each analysis covers twelve code domains. Every section
                    includes the applicable code section reference, the
                    calculated requirement for your project, and any risk flags
                    the system identifies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {FEATURES.map((feat, i) => (
                    <div
                      key={feat.label}
                      className="p-6"
                      style={{
                        borderTop: "1px solid var(--border-light)",
                        borderLeft: i % 3 !== 0 ? "1px solid var(--border-light)" : "none",
                      }}
                    >
                      <p
                        className="text-[9px] font-semibold tracking-widest uppercase mb-3"
                        style={{ color: "var(--accent)" }}
                      >
                        {feat.code}
                      </p>
                      <h4
                        className="text-sm font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {feat.label}
                      </h4>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                      >
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════
                SOCIAL PROOF
                ══════════════════════════════════════ */}
            <section
              className="no-print"
              style={{ background: "var(--bg-base)" }}
            >
              <div className="max-w-7xl mx-auto px-8 py-20">
                <div className="max-w-xl mb-14">
                  <p className="section-label mb-3">Trusted By</p>
                  <h2 className="section-title">
                    Built for architecture firms
                  </h2>
                </div>

                {/* Logo strip placeholder */}
                <div
                  className="flex items-center gap-0 mb-16 overflow-hidden"
                  style={{ borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}
                >
                  {["Firm A", "Firm B", "Firm C", "Firm D", "Firm E"].map((firm) => (
                    <div
                      key={firm}
                      className="flex-1 flex items-center justify-center py-7"
                      style={{ borderRight: "1px solid var(--border-light)" }}
                    >
                      <span
                        className="text-xs tracking-widest uppercase"
                        style={{ color: "var(--border-medium)" }}
                      >
                        {firm}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Testimonials placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {[
                    {
                      quote:
                        "Placeholder testimonial — replace with real client quote. This tool changed how we approach pre-design code research.",
                      name: "Principal Architect",
                      firm: "Architecture Firm",
                    },
                    {
                      quote:
                        "Placeholder testimonial — replace with real client quote. We catch code issues in schematic design now, not during permit review.",
                      name: "Project Manager",
                      firm: "Architecture Firm",
                    },
                    {
                      quote:
                        "Placeholder testimonial — replace with real client quote. The IBC citations alone save us hours of manual code research per project.",
                      name: "Associate",
                      firm: "Architecture Firm",
                    },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="p-8"
                      style={{
                        borderTop: "2px solid var(--border-light)",
                        borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed mb-6 italic"
                        style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                      >
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {t.name}
                        </p>
                        <p
                          className="text-[10px] tracking-wide"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {t.firm}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════
                PRICING
                ══════════════════════════════════════ */}
            <section
              id="pricing"
              className="no-print"
              style={{
                background: "var(--bg-warm)",
                borderTop: "1px solid var(--border-light)",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <div className="max-w-7xl mx-auto px-8 py-20">
                <div className="max-w-xl mb-14">
                  <p className="section-label mb-3">Pricing</p>
                  <h2 className="section-title">Simple, transparent pricing</h2>
                  <p
                    className="text-sm mt-4"
                    style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                  >
                    No setup fees. Cancel anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                  {PLANS.map((plan, i) => (
                    <div
                      key={plan.key}
                      className="p-7"
                      style={{
                        background: plan.highlight ? "#111111" : "transparent",
                        borderTop: plan.highlight
                          ? "2px solid #111111"
                          : "2px solid var(--border-light)",
                        borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                        position: "relative",
                      }}
                    >
                      {plan.highlight && (
                        <p
                          className="text-[9px] font-semibold tracking-widest uppercase mb-4"
                          style={{ color: "var(--accent-light)" }}
                        >
                          Most popular
                        </p>
                      )}
                      <p
                        className="text-xs font-medium tracking-widest uppercase mb-2"
                        style={{ color: plan.highlight ? "rgba(245,242,238,0.5)" : "var(--text-muted)" }}
                      >
                        {plan.name}
                      </p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span
                          className="text-3xl font-light tracking-tight"
                          style={{
                            color: plan.highlight ? "#f5f2ee" : "var(--text-primary)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span
                            className="text-xs"
                            style={{ color: plan.highlight ? "rgba(245,242,238,0.4)" : "var(--text-muted)" }}
                          >
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs mb-6"
                        style={{ color: plan.highlight ? "rgba(245,242,238,0.5)" : "var(--text-secondary)" }}
                      >
                        {plan.briefs}
                      </p>
                      <ul className="space-y-2 mb-7">
                        {plan.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-2 text-xs"
                            style={{ color: plan.highlight ? "rgba(245,242,238,0.65)" : "var(--text-secondary)" }}
                          >
                            <span
                              className="mt-0.5 flex-shrink-0"
                              style={{ color: plan.highlight ? "rgba(245,242,238,0.4)" : "var(--accent)" }}
                            >
                              —
                            </span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                      <a
                        href="/login"
                        className="block w-full py-2.5 text-center text-xs font-medium tracking-widest uppercase transition-colors"
                        style={
                          plan.highlight
                            ? { background: "#f5f2ee", color: "#111111" }
                            : {
                                background: "transparent",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-medium)",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (plan.highlight) {
                            e.currentTarget.style.background = "#e5e0d8";
                          } else {
                            e.currentTarget.style.background = "var(--bg-stone)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (plan.highlight) {
                            e.currentTarget.style.background = "#f5f2ee";
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

            {/* ══════════════════════════════════════
                FAQ
                ══════════════════════════════════════ */}
            <section
              id="faq"
              className="no-print"
              style={{ background: "var(--bg-base)" }}
            >
              <div className="max-w-7xl mx-auto px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div>
                    <p className="section-label mb-3">FAQ</p>
                    <h2 className="section-title">
                      Frequently asked questions
                    </h2>
                  </div>
                  <div className="lg:col-span-2">
                    {FAQS.map((faq, i) => (
                      <div key={i} className="faq-item">
                        <button
                          onClick={() =>
                            setOpenFaq(openFaq === i ? null : i)
                          }
                          className="w-full flex items-center justify-between py-5 text-left"
                        >
                          <span
                            className="text-sm font-medium pr-8"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {faq.q}
                          </span>
                          <span
                            className="flex-shrink-0 text-lg font-light transition-transform"
                            style={{
                              color: "var(--text-muted)",
                              transform: openFaq === i ? "rotate(45deg)" : "none",
                            }}
                          >
                            +
                          </span>
                        </button>
                        {openFaq === i && (
                          <div className="pb-5">
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                            >
                              {faq.a}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
          <div className="max-w-7xl mx-auto px-8 py-16">
            {/* ── Input Form ── */}
            {!brief && (
              <div className="max-w-3xl mx-auto">
                {!displayText && !loading && (
                  <div className="mb-10">
                    <p className="section-label mb-3">Generate</p>
                    <h2 className="section-title">
                      Start your code analysis
                    </h2>
                    <p
                      className="text-sm mt-3"
                      style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                    >
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
                      className="px-7 py-4 flex items-center gap-3"
                      style={{
                        background: "#111111",
                        borderBottom: "1px solid #222",
                      }}
                    >
                      <div
                        className="w-5 h-5 flex items-center justify-center"
                        style={{ border: "1px solid rgba(245,242,238,0.25)" }}
                      >
                        <span
                          className="text-[8px] font-bold"
                          style={{ color: "rgba(245,242,238,0.7)" }}
                        >
                          CB
                        </span>
                      </div>
                      <h3
                        className="text-[10px] font-semibold tracking-widest uppercase"
                        style={{ color: "rgba(245,242,238,0.7)" }}
                      >
                        Project Information
                      </h3>
                    </div>

                    <div className="p-7">
                      {/* Required */}
                      <p
                        className="text-[9px] font-semibold tracking-widest uppercase mb-4"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Required
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-7">
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
                              onChange={(e) =>
                                update("stories", e.target.value)
                              }
                              placeholder="e.g., 4"
                              className="form-input"
                              required
                            />
                          }
                        />
                      </div>

                      {/* Optional */}
                      <div
                        className="pt-6 mb-6"
                        style={{ borderTop: "1px solid var(--border-light)" }}
                      >
                        <p
                          className="text-[9px] font-semibold tracking-widest uppercase mb-4"
                          style={{ color: "var(--text-muted)" }}
                        >
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
                                onChange={(e) =>
                                  update("lotSize", e.target.value)
                                }
                                placeholder="e.g., 10,000 SF"
                                className="form-input"
                              />
                            }
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div
                        className="pt-6"
                        style={{ borderTop: "1px solid var(--border-light)" }}
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
                            />
                          }
                        />
                      </div>

                      {/* Error */}
                      {error && (
                        <div
                          className="mt-5 p-3.5 flex items-start gap-2.5 text-sm"
                          style={{
                            background: "#fef2f2",
                            border: "1px solid #fca5a5",
                            color: "var(--error)",
                          }}
                        >
                          <span className="flex-shrink-0 mt-0.5">—</span>
                          {error}
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <div
                      className="px-7 py-4 flex items-center justify-between"
                      style={{
                        background: "var(--bg-warm)",
                        borderTop: "1px solid var(--border-light)",
                      }}
                    >
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Covers zoning · IBC · IFC · ADA · IECC · IPC · local amendments
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 text-xs transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--text-primary)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-muted)")
                          }
                        >
                          Clear
                        </button>
                        <button
                          type="submit"
                          disabled={!canSubmit || loading}
                          className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            background: "#111111",
                            color: "#f5f2ee",
                          }}
                          onMouseEnter={(e) => {
                            if (canSubmit && !loading)
                              e.currentTarget.style.background = "#333333";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#111111";
                          }}
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
              <div className="max-w-3xl mx-auto">
                <div
                  className="p-14 text-center"
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-medium)",
                  }}
                >
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div
                      className="w-10 h-10 border border-t-transparent animate-spin"
                      style={{
                        borderColor: "var(--border-medium)",
                        borderTopColor: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <p
                    className="text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Searching jurisdiction codes...
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-muted)", fontWeight: 300 }}
                  >
                    Querying public code databases and synthesizing your
                    analysis. Typically 30–60 seconds.
                  </p>
                </div>
              </div>
            )}

            {/* ── Report Output ── */}
            {displayText && (
              <div ref={briefRef} className="max-w-4xl mx-auto">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-5 no-print">
                  <div className="flex items-center gap-3">
                    {loading && (
                      <div
                        className="w-3.5 h-3.5 border border-t-transparent animate-spin"
                        style={{
                          borderColor: "var(--border-medium)",
                          borderTopColor: "var(--text-primary)",
                        }}
                      />
                    )}
                    <span
                      className="text-[10px] font-semibold tracking-widest uppercase"
                      style={{ color: loading ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {loading ? "Generating report..." : "Code Analysis Report"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 text-[10px] font-medium tracking-widest uppercase transition-colors"
                      style={{
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-medium)",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-warm)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-[10px] font-medium tracking-widest uppercase transition-colors"
                      style={{
                        background: "#111111",
                        color: "#f5f2ee",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#333333")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#111111")
                      }
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
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Document Header */}
                  <div
                    className="px-8 py-6"
                    style={{ background: "#111111" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className="text-[8px] font-bold tracking-[0.2em] uppercase mb-2"
                          style={{ color: "var(--accent-light)" }}
                        >
                          Code Analysis Report
                        </p>
                        <h2
                          className="text-xl font-light tracking-tight mb-1"
                          style={{ color: "#f5f2ee", letterSpacing: "-0.01em" }}
                        >
                          {form.buildingType}
                        </h2>
                        <p
                          className="text-sm"
                          style={{ color: "rgba(245,242,238,0.45)" }}
                        >
                          {form.location}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <div
                            className="w-5 h-5 flex items-center justify-center"
                            style={{ border: "1px solid rgba(245,242,238,0.2)" }}
                          >
                            <span
                              className="text-[7px] font-bold"
                              style={{ color: "rgba(245,242,238,0.5)" }}
                            >
                              CB
                            </span>
                          </div>
                          <span
                            className="text-[9px] tracking-widest uppercase"
                            style={{ color: "rgba(245,242,238,0.4)" }}
                          >
                            CodeBrief
                          </span>
                        </div>
                        <p
                          className="text-[10px]"
                          style={{ color: "rgba(245,242,238,0.3)" }}
                        >
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
                      className="flex flex-wrap gap-8 mt-5 pt-4"
                      style={{ borderTop: "1px solid rgba(245,242,238,0.08)" }}
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

                  {/* Content */}
                  <div className="px-8 py-8">
                    <div
                      className={`brief-content${loading ? " streaming-cursor" : ""}`}
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(displayText),
                      }}
                    />
                  </div>

                  {/* Disclaimer */}
                  <div
                    className="mx-8 mb-6 px-5 py-4"
                    style={{
                      background: "var(--bg-warm)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <p
                      className="text-[10px] leading-relaxed"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <strong style={{ color: "var(--text-secondary)" }}>
                        Disclaimer:
                      </strong>{" "}
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
                      background: "#111111",
                      borderTop: "1px solid #222",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 flex items-center justify-center"
                        style={{ border: "1px solid rgba(245,242,238,0.15)" }}
                      >
                        <span
                          className="text-[6px] font-bold"
                          style={{ color: "rgba(245,242,238,0.35)" }}
                        >
                          CB
                        </span>
                      </div>
                      <span
                        className="text-[9px] tracking-widest uppercase"
                        style={{ color: "rgba(245,242,238,0.3)" }}
                      >
                        Generated by CodeBrief
                      </span>
                    </div>
                    <span
                      className="text-[9px]"
                      style={{ color: "rgba(245,242,238,0.2)" }}
                    >
                      codebrief.ai
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════
            BOTTOM CTA
            ══════════════════════════════════════ */}
        {!displayText && !loading && (
          <section
            className="no-print"
            style={{
              background: "#111111",
              borderTop: "1px solid #222",
            }}
          >
            <div className="max-w-7xl mx-auto px-8 py-20 text-center">
              <p className="section-label mb-4" style={{ color: "var(--accent-light)" }}>
                For Architects
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight mb-5"
                style={{ color: "#f5f2ee", letterSpacing: "-0.02em" }}
              >
                Start your first code analysis
              </h2>
              <p
                className="text-sm mb-8 max-w-md mx-auto"
                style={{ color: "rgba(245,242,238,0.4)", fontWeight: 300 }}
              >
                Free tier includes 2 briefs per month. No credit card required.
              </p>
              <button
                onClick={scrollToForm}
                className="px-8 py-3.5 text-xs font-medium tracking-widest uppercase transition-colors"
                style={{
                  background: "#f5f2ee",
                  color: "#111111",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e5e0d8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f5f2ee")
                }
              >
                Generate a Brief
              </button>
            </div>
          </section>
        )}
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
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 flex items-center justify-center"
              style={{ border: "1px solid var(--border-medium)" }}
            >
              <span
                className="text-[7px] font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                CB
              </span>
            </div>
            <span
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              &copy; {new Date().getFullYear()} CodeBrief
            </span>
          </div>
          <span
            className="text-[11px]"
            style={{ color: "var(--border-medium)" }}
          >
            Pre-design code intelligence for architects
          </span>
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
        className="block text-[9px] font-semibold tracking-widest uppercase mb-1.5"
        style={{ color: "var(--text-muted)" }}
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
      <p
        className="text-[8px] tracking-widest uppercase mb-0.5"
        style={{ color: "rgba(245,242,238,0.35)" }}
      >
        {label}
      </p>
      <p
        className="text-sm font-light"
        style={{ color: "#f5f2ee", letterSpacing: "-0.01em" }}
      >
        {value}
      </p>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string;
}
