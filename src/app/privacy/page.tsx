"use client";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <nav className="sticky top-0 z-50" style={{ background: "#f7f3ec", borderBottom: "1px solid #ddd5c8" }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ border: "1px solid #1c1a17" }}>
              <span className="text-[10px] font-bold tracking-tight" style={{ color: "#1c1a17" }}>CB</span>
            </div>
            <span className="text-sm font-medium tracking-widest uppercase" style={{ color: "#1c1a17", letterSpacing: "0.12em" }}>CodeBrief</span>
          </a>
        </div>
      </nav>
      <main className="flex-1">
        <section style={{ background: "#111111" }}>
          <div className="max-w-3xl mx-auto px-8 py-14">
            <p className="section-label mb-4" style={{ color: "rgba(245,242,238,0.4)" }}>Legal</p>
            <h1 className="text-4xl font-light tracking-tight" style={{ color: "#f5f2ee", letterSpacing: "-0.02em", fontFamily: "var(--font-serif-display), Georgia, serif", fontWeight: 400 }}>Privacy Policy</h1>
            <p className="text-sm mt-3" style={{ color: "rgba(245,242,238,0.4)", fontWeight: 300 }}>Last updated: January 1, 2025</p>
          </div>
        </section>
        <section style={{ background: "#ffffff" }}>
          <div className="max-w-3xl mx-auto px-8 py-12 space-y-8">
            {[
              { title: "Information We Collect", body: "We collect information you provide directly to us, including when you create an account (name, email address), submit project parameters for code analysis (building type, location, square footage, and other project details), or contact us for support. We also collect usage data including pages visited, features used, and reports generated." },
              { title: "How We Use Your Information", body: "We use the information we collect to provide, maintain, and improve CodeBrief; generate code analysis reports based on your project parameters; send transactional emails (account confirmation, password reset, billing receipts); and communicate product updates when you have opted in." },
              { title: "Data Storage and Security", body: "Your account data and generated reports are stored in Supabase, a SOC 2 Type II certified database provider. We use industry-standard encryption in transit (TLS 1.2+) and at rest. Project parameters submitted for analysis are processed by Anthropic's Claude API and are subject to Anthropic's data processing terms." },
              { title: "Data Sharing", body: "We do not sell your personal information. We share data with service providers who assist in operating CodeBrief (Supabase for database, Anthropic for AI generation, Stripe for payment processing). Each provider is bound by data processing agreements. We may disclose information if required by law or to protect the rights and safety of CodeBrief and its users." },
              { title: "Data Retention", body: "We retain your account information and generated reports for as long as your account is active. You may delete your account and associated data at any time by contacting us at privacy@codebrief.ai. Anonymized, aggregated usage data may be retained indefinitely." },
              { title: "Your Rights", body: "You have the right to access, correct, or delete your personal information. You may also request a copy of your data in a portable format. To exercise these rights, contact us at privacy@codebrief.ai. We will respond within 30 days." },
              { title: "Contact", body: "For privacy-related questions, contact us at privacy@codebrief.ai." },
            ].map((section) => (
              <div key={section.title} className="pb-8" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <h2 className="text-base font-medium mb-3" style={{ color: "var(--text-primary)" }}>{section.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer style={{ background: "var(--bg-warm)", borderTop: "1px solid var(--border-light)" }}>
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>&copy; {new Date().getFullYear()} CodeBrief</span>
          <div className="flex items-center gap-6">
            {([["/", "Home"], ["/privacy", "Privacy"], ["/terms", "Terms"]] as [string, string][]).map(([href, label]) => (
              <a key={label} href={href} className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
