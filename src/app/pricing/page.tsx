"use client";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For architects exploring CodeBrief.",
    briefs: "2 briefs / month",
    features: [
      "Code Analysis report",
      "IBC + Zoning + ADA coverage",
      "PDF export",
      "City Code Directory access",
    ],
    cta: "Get Started",
    href: "/#generate",
    highlight: false,
  },
  {
    name: "Solo",
    price: "$29",
    period: "per month",
    description: "For individual architects and small projects.",
    briefs: "20 briefs / month",
    features: [
      "All Free features",
      "All 10 report types",
      "Confidence tier indicators",
      "Sources page per report",
      "Saved brief history",
      "Priority generation",
    ],
    cta: "Start Solo",
    href: "/login",
    highlight: false,
  },
  {
    name: "Firm",
    price: "$89",
    period: "per month",
    description: "For architecture firms running multiple projects.",
    briefs: "Unlimited briefs",
    features: [
      "All Solo features",
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
      "All Firm features",
      "Unlimited team members",
      "SSO / SAML",
      "Custom data integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Us",
    href: "mailto:hello@codebrief.ai",
    highlight: false,
  },
];

const FAQS = [
  { q: "What counts as a brief?", a: "Each time you submit the form and receive a generated report, that counts as one brief. Regenerating the same project or switching report types counts as a new brief." },
  { q: "Can I upgrade or downgrade at any time?", a: "Yes. Plan changes take effect immediately. If you upgrade mid-cycle, you're charged the prorated difference. If you downgrade, the change applies at the next billing date." },
  { q: "Is there a free trial for paid plans?", a: "The Free plan gives you 2 briefs per month indefinitely — no credit card required. Paid plans do not have a separate trial period, but you can cancel at any time." },
  { q: "What report types are included?", a: "Solo and above includes all 10 report types: Code Analysis, Zoning Feasibility, Energy Compliance, Cost Context, Risk Due Diligence, Site Constraints, Sustainability Scoping, Permitting Pathway, Accessibility Review, and Consultant Scoping." },
  { q: "How accurate are the reports?", a: "Reports are AI-generated research guidance based on publicly available code data. Each claim is tagged with a confidence tier (Confirmed, Verify, or Gap). All reports include a sources page and a disclaimer recommending AHJ verification before design or permit submission." },
  { q: "Do you offer academic or non-profit pricing?", a: "Yes. Contact us at hello@codebrief.ai with your institution or organization details." },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50" style={{ background: "#f7f3ec", borderBottom: "1px solid #ddd5c8" }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ border: "1px solid #1c1a17" }}>
              <span className="text-[10px] font-bold tracking-tight" style={{ color: "#1c1a17" }}>CB</span>
            </div>
            <span className="text-sm font-medium tracking-widest uppercase" style={{ color: "#1c1a17", letterSpacing: "0.12em" }}>CodeBrief</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[["/#how-it-works","How it works"],["/#features","Features"],["/codes","City Codes"],["/#faq","FAQ"]].map(([href,label]) => (
              <a key={label} href={href} className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>{label}</a>
            ))}
            <a href="/pricing" className="text-xs tracking-wide" style={{ color: "#1c1a17", borderBottom: "1px solid #1c1a17", paddingBottom: "1px" }}>Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>Sign In</a>
            <a href="/#generate" className="px-4 py-2 text-xs font-medium tracking-widest uppercase" style={{ background: "#1c1a17", color: "#f7f3ec" }}>Get Started</a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Header ── */}
        <section style={{ background: "#111111" }}>
          <div className="max-w-7xl mx-auto px-8 py-16 text-center">
            <p className="section-label mb-4" style={{ color: "rgba(245,242,238,0.4)" }}>Pricing</p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight mb-4"
              style={{ color: "#f5f2ee", letterSpacing: "-0.02em", fontFamily: "var(--font-serif-display), Georgia, serif", fontWeight: 400 }}
            >
              Simple, transparent pricing
            </h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(245,242,238,0.5)", fontWeight: 300 }}>
              Start free. Upgrade when you need more. No hidden fees, no per-report charges on paid plans.
            </p>
          </div>
        </section>

        {/* ── Plans ── */}
        <section style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border-light)" }}>
          <div className="max-w-7xl mx-auto px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
              {PLANS.map((plan, i) => (
                <div
                  key={plan.name}
                  className="relative flex flex-col"
                  style={{
                    border: "1px solid",
                    borderColor: plan.highlight ? "#111111" : "var(--border-light)",
                    marginLeft: i > 0 ? "-1px" : "0",
                    background: plan.highlight ? "#111111" : "#ffffff",
                    zIndex: plan.highlight ? 1 : 0,
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-[9px] font-semibold tracking-widest uppercase" style={{ background: "#f5f2ee", color: "#111111" }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    <p
                      className="text-[10px] font-semibold tracking-widest uppercase mb-3"
                      style={{ color: plan.highlight ? "rgba(245,242,238,0.5)" : "var(--text-muted)" }}
                    >
                      {plan.name}
                    </p>
                    <div className="mb-2">
                      <span
                        className="text-3xl font-light tracking-tight"
                        style={{ color: plan.highlight ? "#f5f2ee" : "var(--text-primary)", letterSpacing: "-0.02em" }}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className="text-xs ml-1"
                          style={{ color: plan.highlight ? "rgba(245,242,238,0.4)" : "var(--text-muted)" }}
                        >
                          / {plan.period}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs mb-4"
                      style={{ color: plan.highlight ? "rgba(245,242,238,0.5)" : "var(--text-secondary)", fontWeight: 300 }}
                    >
                      {plan.description}
                    </p>
                    <div
                      className="text-[10px] font-semibold tracking-widest uppercase py-2 px-3 mb-5 text-center"
                      style={{
                        background: plan.highlight ? "rgba(245,242,238,0.08)" : "var(--bg-warm)",
                        color: plan.highlight ? "rgba(245,242,238,0.6)" : "var(--text-muted)",
                        border: `1px solid ${plan.highlight ? "rgba(245,242,238,0.1)" : "var(--border-light)"}`,
                      }}
                    >
                      {plan.briefs}
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: plan.highlight ? "rgba(245,242,238,0.4)" : "var(--text-muted)" }}>—</span>
                          <span className="text-xs" style={{ color: plan.highlight ? "rgba(245,242,238,0.7)" : "var(--text-secondary)", fontWeight: 300 }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={plan.href}
                      className="block text-center px-4 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors"
                      style={{
                        background: plan.highlight ? "#f5f2ee" : "#111111",
                        color: plan.highlight ? "#111111" : "#f5f2ee",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = plan.highlight ? "#e5e0d8" : "#333333";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = plan.highlight ? "#f5f2ee" : "#111111";
                      }}
                    >
                      {plan.cta}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ background: "var(--bg-warm)" }}>
          <div className="max-w-3xl mx-auto px-8 py-16">
            <p className="section-label mb-4">FAQ</p>
            <h2 className="section-title mb-10">Common questions</h2>
            <div className="space-y-0">
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <details className="group">
                    <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
                      <span className="text-sm font-medium pr-8" style={{ color: "var(--text-primary)" }}>{faq.q}</span>
                      <span className="flex-shrink-0 text-lg font-light transition-transform group-open:rotate-45" style={{ color: "var(--text-muted)" }}>+</span>
                    </summary>
                    <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{faq.a}</p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: "#111111", borderTop: "1px solid #222" }}>
          <div className="max-w-7xl mx-auto px-8 py-16 text-center">
            <h2 className="text-3xl font-light tracking-tight mb-4" style={{ color: "#f5f2ee", letterSpacing: "-0.02em" }}>
              Start with 2 free briefs
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(245,242,238,0.4)", fontWeight: 300 }}>
              No credit card required. Upgrade when you need more.
            </p>
            <a
              href="/#generate"
              className="inline-block px-8 py-3.5 text-xs font-medium tracking-widest uppercase transition-colors"
              style={{ background: "#f5f2ee", color: "#111111" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e0d8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f2ee")}
            >
              Generate a Brief
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
              <a key={label} href={href} className="text-[11px] transition-colors" style={{ color: "var(--text-muted)" }} onMouseEnter={(e)=>(e.currentTarget.style.color="var(--text-primary)")} onMouseLeave={(e)=>(e.currentTarget.style.color="var(--text-muted)")}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
