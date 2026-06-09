"use client";
import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For architects exploring CodeBrief.",
    briefs: "2 briefs / month",
    features: [
      "Full code analysis report",
      "IBC + Zoning + ADA coverage",
      "PDF export",
      "City Code Directory access",
    ],
    cta: "Get Started Free",
    href: "/#generate",
    highlight: false,
    badge: null,
  },
  {
    name: "Solo",
    price: "$29",
    period: "/ month",
    description: "For individual architects and small projects.",
    briefs: "20 briefs / month",
    features: [
      "Everything in Free",
      "All 10 report types",
      "Confidence tier indicators",
      "Sources page per report",
      "Saved brief history",
      "Priority generation",
    ],
    cta: "Start Solo",
    href: "/login",
    highlight: false,
    badge: null,
  },
  {
    name: "Firm",
    price: "$89",
    period: "/ month",
    description: "For architecture firms running multiple projects.",
    briefs: "Unlimited briefs",
    features: [
      "Everything in Solo",
      "Up to 5 team members",
      "Shared brief library",
      "Custom report branding",
      "API access (beta)",
      "Priority support",
    ],
    cta: "Start Firm",
    href: "/login",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large firms and platform integrations.",
    briefs: "Unlimited",
    features: [
      "Everything in Firm",
      "Unlimited team members",
      "SSO / SAML",
      "Custom data integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Us",
    href: "mailto:hello@codebrief.ai",
    highlight: false,
    badge: null,
  },
];

const COMPARE = [
  { feature: "Full code analysis report", free: true, solo: true, firm: true, enterprise: true },
  { feature: "IBC + Zoning + ADA coverage", free: true, solo: true, firm: true, enterprise: true },
  { feature: "PDF export", free: true, solo: true, firm: true, enterprise: true },
  { feature: "City Code Directory", free: true, solo: true, firm: true, enterprise: true },
  { feature: "All 10 report types", free: false, solo: true, firm: true, enterprise: true },
  { feature: "Confidence tier indicators", free: false, solo: true, firm: true, enterprise: true },
  { feature: "Saved brief history", free: false, solo: true, firm: true, enterprise: true },
  { feature: "Team members", free: "1", solo: "1", firm: "5", enterprise: "Unlimited" },
  { feature: "Shared brief library", free: false, solo: false, firm: true, enterprise: true },
  { feature: "Custom report branding", free: false, solo: false, firm: true, enterprise: true },
  { feature: "API access", free: false, solo: false, firm: "Beta", enterprise: true },
  { feature: "SSO / SAML", free: false, solo: false, firm: false, enterprise: true },
  { feature: "SLA guarantee", free: false, solo: false, firm: false, enterprise: true },
];

const COMPETITORS = [
  { name: "CodeBrief", price: "Free – $89/mo", reports: "12 code domains", citations: true, confidence: true, pdf: true, highlight: true },
  { name: "UpCodes", price: "$45/mo", reports: "Code lookup only", citations: false, confidence: false, pdf: false, highlight: false },
  { name: "Zoneomics", price: "$61/mo", reports: "Zoning only", citations: false, confidence: false, pdf: false, highlight: false },
  { name: "Manual research", price: "4–8 hrs/project", reports: "Varies", citations: false, confidence: false, pdf: false, highlight: false },
];

const FAQS = [
  { q: "What counts as a brief?", a: "Each time you submit the form and receive a generated report, that counts as one brief. Regenerating the same project or switching report types counts as a new brief." },
  { q: "Can I upgrade or downgrade at any time?", a: "Yes. Plan changes take effect immediately. If you upgrade mid-cycle, you're charged the prorated difference. If you downgrade, the change applies at the next billing date." },
  { q: "Is there a free trial for paid plans?", a: "The Free plan gives you 2 briefs per month indefinitely — no credit card required. Paid plans do not have a separate trial period, but you can cancel at any time." },
  { q: "What report types are included?", a: "Solo and above includes all 10 report types: Code Analysis, Zoning Feasibility, Energy Compliance, Cost Context, Risk Due Diligence, Site Constraints, Sustainability Scoping, Permitting Pathway, Accessibility Review, and Consultant Scoping." },
  { q: "How accurate are the reports?", a: "Reports are AI-generated research guidance based on publicly available code data. Each claim is tagged with a confidence tier (Confirmed, Verify, or Gap). All reports include a sources page and a disclaimer recommending AHJ verification before design or permit submission." },
  { q: "Do you offer academic or non-profit pricing?", a: "Yes. Contact us at hello@codebrief.ai with your institution or organization details." },
];

function CheckIcon({ color = "#1c1a17" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8L6.5 11.5L13 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5 5L11 11M11 5L5 11" stroke="#c8bfb4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50" style={{ background: "rgba(235,232,226,0.97)", borderBottom: "1px solid var(--border-light)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ border: "1px solid #1c1a17" }}>
              <span className="text-[10px] font-bold tracking-tight" style={{ color: "#1c1a17" }}>CB</span>
            </div>
            <span className="text-sm font-medium tracking-widest uppercase" style={{ color: "#1c1a17", letterSpacing: "0.12em" }}>CodeBrief</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[["/#how-it-works","How it works"],["/#features","Features"],["/codes","City Codes"],["/#faq","FAQ"]].map(([href,label]) => (
              <a key={label} href={href} className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }}
                onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")}
                onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>{label}</a>
            ))}
            <a href="/pricing" className="text-xs tracking-wide" style={{ color: "#1c1a17", borderBottom: "1px solid #1c1a17", paddingBottom: "1px" }}>Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }}
              onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")}
              onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>Sign In</a>
            <a href="/#generate" className="px-4 py-2 text-xs font-medium tracking-widest uppercase" style={{ background: "#1c1a17", color: "#f7f3ec" }}>Get Started</a>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border-light)", paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="max-w-7xl mx-auto px-8 text-center">
            <p className="section-label mb-4">Pricing</p>
            <h1
              style={{
                fontFamily: "var(--font-serif-display), Georgia, serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.1,
                marginBottom: "1.25rem",
              }}
            >
              Simple, transparent pricing
            </h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7 }}>
              Start free. Upgrade when you need more. No hidden fees, no per-report charges on paid plans.
            </p>
          </div>
        </section>

        {/* ── Plans Grid ── */}
        <section style={{ background: "var(--bg-base)", paddingTop: "64px", paddingBottom: "64px" }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0" style={{ border: "1px solid var(--border-light)" }}>
              {PLANS.map((plan, i) => (
                <div
                  key={plan.name}
                  className="relative flex flex-col"
                  style={{
                    borderRight: i < PLANS.length - 1 ? "1px solid var(--border-light)" : "none",
                    background: plan.highlight ? "#1c1a17" : "#ffffff",
                    position: "relative",
                  }}
                >
                  {plan.badge && (
                    <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
                      <span className="px-3 py-1 text-[9px] font-semibold tracking-widest uppercase"
                        style={{ background: "var(--accent)", color: "#1c1a17" }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-7 flex-1 flex flex-col">
                    {/* Plan name */}
                    <p className="text-[10px] font-semibold tracking-widest uppercase mb-4"
                      style={{ color: plan.highlight ? "rgba(245,242,238,0.45)" : "var(--text-muted)" }}>
                      {plan.name}
                    </p>

                    {/* Price */}
                    <div className="mb-1 flex items-baseline gap-1">
                      <span style={{
                        fontFamily: "var(--font-serif-display), Georgia, serif",
                        fontSize: "2.5rem",
                        fontWeight: 400,
                        letterSpacing: "-0.03em",
                        color: plan.highlight ? "#f5f2ee" : "var(--text-primary)",
                        lineHeight: 1,
                      }}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs" style={{ color: plan.highlight ? "rgba(245,242,238,0.35)" : "var(--text-muted)" }}>
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {/* Brief count pill */}
                    <div className="text-[10px] font-semibold tracking-widest uppercase py-1.5 px-3 mb-5 inline-block"
                      style={{
                        background: plan.highlight ? "rgba(245,242,238,0.08)" : "var(--bg-warm)",
                        color: plan.highlight ? "rgba(245,242,238,0.55)" : "var(--text-muted)",
                        border: `1px solid ${plan.highlight ? "rgba(245,242,238,0.1)" : "var(--border-light)"}`,
                        marginTop: "12px",
                      }}>
                      {plan.briefs}
                    </div>

                    {/* Description */}
                    <p className="text-xs mb-5" style={{ color: plan.highlight ? "rgba(245,242,238,0.45)" : "var(--text-secondary)", fontWeight: 300, lineHeight: 1.6 }}>
                      {plan.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex-shrink-0">
                            <CheckIcon color={plan.highlight ? "rgba(245,242,238,0.6)" : "#1c1a17"} />
                          </span>
                          <span className="text-xs leading-relaxed" style={{ color: plan.highlight ? "rgba(245,242,238,0.65)" : "var(--text-secondary)", fontWeight: 300 }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={plan.href}
                      className="block text-center px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors"
                      style={{
                        background: plan.highlight ? "var(--accent)" : "#1c1a17",
                        color: plan.highlight ? "#1c1a17" : "#f5f2ee",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.85";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      {plan.cta} →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Compare toggle */}
            <div className="text-center mt-8">
              <button
                onClick={() => setShowCompare(!showCompare)}
                className="text-xs tracking-wide transition-colors"
                style={{ color: "var(--text-muted)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
              >
                {showCompare ? "Hide" : "Show"} full feature comparison
              </button>
            </div>

            {/* Comparison table */}
            {showCompare && (
              <div className="mt-8 overflow-x-auto" style={{ border: "1px solid var(--border-light)" }}>
                <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-warm)" }}>
                      <th className="text-left px-5 py-3 font-medium" style={{ color: "var(--text-muted)", width: "35%" }}>Feature</th>
                      {["Free","Solo","Firm","Enterprise"].map((h, i) => (
                        <th key={h} className="px-5 py-3 font-semibold text-center text-[10px] tracking-widest uppercase"
                          style={{ color: i === 2 ? "var(--accent-dark)" : "var(--text-primary)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((row, i) => (
                      <tr key={row.feature} style={{ borderBottom: "1px solid var(--border-light)", background: i % 2 === 0 ? "#ffffff" : "var(--bg-base)" }}>
                        <td className="px-5 py-3" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{row.feature}</td>
                        {(["free","solo","firm","enterprise"] as const).map((tier) => {
                          const val = row[tier];
                          return (
                            <td key={tier} className="px-5 py-3 text-center">
                              {val === true ? <span className="flex justify-center"><CheckIcon /></span>
                                : val === false ? <span className="flex justify-center"><XIcon /></span>
                                : <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{val}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Competitor Comparison ── */}
        <section style={{ background: "var(--bg-warm)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", paddingTop: "64px", paddingBottom: "64px" }}>
          <div className="max-w-5xl mx-auto px-8">
            <p className="section-label mb-4 text-center">Why CodeBrief</p>
            <h2 className="section-title mb-12 text-center">The only tool built for pre-design code research</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                    <th className="text-left pb-4 pr-6 font-medium text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Tool</th>
                    <th className="text-left pb-4 pr-6 font-medium text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Price</th>
                    <th className="text-left pb-4 pr-6 font-medium text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Coverage</th>
                    <th className="text-center pb-4 pr-6 font-medium text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Citations</th>
                    <th className="text-center pb-4 pr-6 font-medium text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Confidence</th>
                    <th className="text-center pb-4 font-medium text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((c, i) => (
                    <tr key={c.name} style={{
                      borderBottom: i < COMPETITORS.length - 1 ? "1px solid var(--border-light)" : "none",
                      background: c.highlight ? "rgba(200,180,80,0.06)" : "transparent",
                    }}>
                      <td className="py-4 pr-6">
                        <span className="font-semibold text-sm" style={{ color: c.highlight ? "var(--text-primary)" : "var(--text-secondary)" }}>
                          {c.name}
                        </span>
                        {c.highlight && (
                          <span className="ml-2 px-2 py-0.5 text-[9px] font-semibold tracking-widest uppercase"
                            style={{ background: "var(--accent)", color: "#1c1a17" }}>
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-6 text-xs" style={{ color: c.highlight ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: c.highlight ? 500 : 300 }}>{c.price}</td>
                      <td className="py-4 pr-6 text-xs" style={{ color: c.highlight ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: c.highlight ? 500 : 300 }}>{c.reports}</td>
                      <td className="py-4 pr-6 text-center">{c.citations ? <span className="flex justify-center"><CheckIcon /></span> : <span className="flex justify-center"><XIcon /></span>}</td>
                      <td className="py-4 pr-6 text-center">{c.confidence ? <span className="flex justify-center"><CheckIcon /></span> : <span className="flex justify-center"><XIcon /></span>}</td>
                      <td className="py-4 text-center">{c.pdf ? <span className="flex justify-center"><CheckIcon /></span> : <span className="flex justify-center"><XIcon /></span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ background: "var(--bg-base)", paddingTop: "64px", paddingBottom: "64px" }}>
          <div className="max-w-3xl mx-auto px-8">
            <p className="section-label mb-4">FAQ</p>
            <h2 className="section-title mb-10">Common questions</h2>
            <div className="space-y-0">
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    className="w-full flex items-center justify-between py-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span className="text-sm font-medium pr-8" style={{ color: "var(--text-primary)" }}>{faq.q}</span>
                    <span className="flex-shrink-0 text-xl font-light transition-transform"
                      style={{ color: "var(--text-muted)", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>+</span>
                  </button>
                  {openFaq === i && (
                    <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: "#1c1a17", paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="max-w-7xl mx-auto px-8 text-center">
            <h2 style={{
              fontFamily: "var(--font-serif-display), Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#f5f2ee",
              marginBottom: "1rem",
            }}>
              Start with 2 free briefs
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(245,242,238,0.45)", fontWeight: 300 }}>
              No credit card required. Upgrade when you need more.
            </p>
            <a
              href="/#generate"
              className="inline-block px-8 py-3.5 text-xs font-medium tracking-widest uppercase transition-opacity"
              style={{ background: "var(--accent)", color: "#1c1a17" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Generate a Brief Free →
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--bg-warm)", borderTop: "1px solid var(--border-light)" }}>
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>&copy; {new Date().getFullYear()} CodeBrief</span>
          <div className="flex items-center gap-6">
            {[["/","Home"],["/codes","City Codes"],["/pricing","Pricing"],["/privacy","Privacy"],["/terms","Terms"]].map(([href,label]) => (
              <a key={label} href={href} className="text-[11px] transition-colors" style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e)=>(e.currentTarget.style.color="var(--text-primary)")}
                onMouseLeave={(e)=>(e.currentTarget.style.color="var(--text-muted)")}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
