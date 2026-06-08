"use client";

import { useParams } from "next/navigation";
import { BLOG_POSTS } from "../page";

const BLOG_CONTENT: Record<string, string> = {
  "ibc-2024-key-changes": `
## Overview

The 2024 International Building Code (IBC 2024) was published by the International Code Council (ICC) in late 2023 and is currently being adopted by states on a rolling basis. Most jurisdictions will transition between 2025 and 2027.

## Key Changes in IBC 2024

### 1. Occupancy Classification Updates

Section 303 has been revised to clarify the classification of mixed-use assembly spaces. Spaces that previously required case-by-case AHJ interpretation now have explicit classification criteria. This affects co-working spaces, event venues, and hybrid retail/assembly uses.

### 2. Egress Width Calculations

The minimum corridor width calculation in Section 1005 has been updated. The occupant load factor for business occupancies (Group B) has been revised from 100 SF per person to 150 SF per person in open-plan office configurations, reflecting post-pandemic workplace density changes.

### 3. Accessible Means of Egress

Section 1009 now requires accessible means of egress in all new construction regardless of building height, closing a previous exception for buildings under 4 stories. This aligns IBC with ADA requirements and eliminates a common source of AHJ interpretation disputes.

### 4. High-Rise Definition

The high-rise threshold remains at 75 feet above the lowest level of fire department vehicle access. However, new provisions in Section 403 clarify how to measure this threshold for buildings on sloped sites — a frequent source of ambiguity in previous editions.

### 5. Energy Code Alignment

IBC 2024 references ASHRAE 90.1-2022 rather than 90.1-2019, which has implications for envelope performance, mechanical systems, and lighting power density requirements.

## What Hasn't Changed

The fundamental structure of IBC — occupancy groups, construction types, fire resistance ratings, and the Table 503 height/area matrix — remains consistent with IBC 2021. Architects familiar with the 2021 edition will find the 2024 changes incremental rather than structural.

## Adoption Status

As of early 2025, IBC 2024 has been formally adopted by: Colorado, New Jersey, and several municipalities. Most states are still on IBC 2021 or IBC 2018. Always verify the adopted edition with the AHJ for your specific jurisdiction.

---

*Always verify current code adoption with the Authority Having Jurisdiction before proceeding with design or permit applications.*
`,
  "pre-design-code-research": `
## The Cost of Late Discovery

In a typical architecture project, code issues discovered during design development cost 2–4x more to resolve than the same issues found in pre-design. Issues discovered during permit review cost 8–12x more. This is not a theoretical risk — it's a pattern that repeats across project types and firm sizes.

The most common late-discovered code issues are:

1. **Zoning non-conformance** — setback, FAR, or height violations that require site redesign
2. **Construction type mismatch** — a selected construction type that doesn't support the required height or area
3. **Egress deficiencies** — insufficient exit width, travel distance, or exit count
4. **Accessibility gaps** — accessible route discontinuities or non-compliant toilet room configurations
5. **Energy code conflicts** — envelope or mechanical systems that don't meet IECC requirements

## A Systematic Pre-Design Checklist

### Zoning (Week 1)

- Confirm the zoning district and all applicable overlay districts
- Verify maximum FAR, height, and lot coverage
- Confirm setbacks (front, side, rear, and any special setbacks)
- Check parking requirements for the proposed use
- Identify any conditional use permits required

### Building Code (Week 1–2)

- Confirm the adopted IBC edition and any local amendments
- Classify the occupancy group(s)
- Determine the required construction type based on Table 503
- Calculate allowable height and area
- Identify fire protection requirements (sprinklers, fire walls)

### Accessibility (Week 2)

- Confirm ADA and local accessibility code requirements
- Identify accessible route requirements from site to all program areas
- Check toilet room count and configuration requirements
- Verify accessible parking requirements

### Energy Code (Week 2)

- Confirm the adopted IECC edition
- Identify climate zone
- Determine envelope performance requirements
- Check mechanical system requirements

## The 60-Second Alternative

CodeBrief automates this checklist. Enter your project parameters and receive a complete pre-design code analysis in 60 seconds, covering all of the above plus fire separation, egress, plumbing, and risk flags.

---

*This guide reflects general practice. Requirements vary by jurisdiction.*
`,
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const content = BLOG_CONTENT[slug];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="text-center">
          <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>Post not found</p>
          <a href="/blog" className="text-xs underline" style={{ color: "var(--accent)" }}>Back to blog</a>
        </div>
      </div>
    );
  }

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
          <a href="/blog" className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>← Blog</a>
          <a href="/#generate" className="px-4 py-2 text-xs font-medium tracking-widest uppercase" style={{ background: "#1c1a17", color: "#f7f3ec" }}>Get Started</a>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Post Header ── */}
        <section style={{ background: "#111111" }}>
          <div className="max-w-3xl mx-auto px-8 py-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-1" style={{ background: "rgba(245,242,238,0.08)", color: "rgba(245,242,238,0.5)", border: "1px solid rgba(245,242,238,0.1)" }}>
                {post.category}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(245,242,238,0.3)" }}>{post.readTime}</span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-light tracking-tight mb-4"
              style={{ color: "#f5f2ee", letterSpacing: "-0.02em", fontFamily: "var(--font-serif-display), Georgia, serif", fontWeight: 400 }}
            >
              {post.title}
            </h1>
            <p className="text-sm" style={{ color: "rgba(245,242,238,0.4)", fontWeight: 300 }}>
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </section>

        {/* ── Post Content ── */}
        <section style={{ background: "#ffffff", borderBottom: "1px solid var(--border-light)" }}>
          <div className="max-w-3xl mx-auto px-8 py-12">
            {content ? (
              <div
                className="brief-content"
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.1rem;font-weight:500;letter-spacing:-0.01em;margin:2rem 0 0.75rem;color:var(--text-primary)">$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.9rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:1.5rem 0 0.5rem;color:var(--text-muted)">$1</h3>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
                    .replace(/^(\d+)\. \*\*(.+?)\*\* — (.+)$/gm, '<div style="display:flex;gap:0.75rem;margin:0.5rem 0"><span style="color:var(--text-muted);font-size:0.75rem;flex-shrink:0;margin-top:0.1rem">$1.</span><p style="font-size:0.875rem;color:var(--text-secondary);font-weight:300;margin:0"><strong style="color:var(--text-primary)">$2</strong> — $3</p></div>')
                    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:0.75rem;margin:0.4rem 0"><span style="color:var(--text-muted);flex-shrink:0">—</span><p style="font-size:0.875rem;color:var(--text-secondary);font-weight:300;margin:0">$1</p></div>')
                    .replace(/^(?!<)((?!##|###).+)$/gm, '<p style="font-size:0.875rem;line-height:1.7;color:var(--text-secondary);font-weight:300;margin:0.75rem 0">$1</p>')
                    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border-light);margin:2rem 0">')
                }}
              />
            ) : (
              <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                {post.excerpt}
              </p>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: "#111111", borderTop: "1px solid #222" }}>
          <div className="max-w-3xl mx-auto px-8 py-12 text-center">
            <p className="text-[9px] font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(245,242,238,0.4)" }}>Try CodeBrief</p>
            <h2 className="text-2xl font-light tracking-tight mb-3" style={{ color: "#f5f2ee", letterSpacing: "-0.02em" }}>
              Generate a code analysis in 60 seconds
            </h2>
            <p className="text-sm mb-6" style={{ color: "rgba(245,242,238,0.4)", fontWeight: 300 }}>Free tier — no credit card required.</p>
            <a href="/#generate" className="inline-block px-6 py-3 text-xs font-medium tracking-widest uppercase" style={{ background: "#f5f2ee", color: "#111111" }}>
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
            {[["/","Home"],["/codes","City Codes"],["/pricing","Pricing"],["/blog","Blog"],["/privacy","Privacy"],["/terms","Terms"]].map(([href,label]) => (
              <a key={label} href={href} className="text-[11px] transition-colors" style={{ color: "var(--text-muted)" }} onMouseEnter={(e)=>(e.currentTarget.style.color="var(--text-primary)")} onMouseLeave={(e)=>(e.currentTarget.style.color="var(--text-muted)")}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
