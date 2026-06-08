"use client";

export const BLOG_POSTS = [
  {
    slug: "ibc-2024-key-changes",
    title: "IBC 2024: Key Changes Architects Need to Know",
    excerpt: "The 2024 International Building Code introduces significant updates to occupancy classifications, egress requirements, and accessibility standards. Here's what changes and what stays the same.",
    date: "2025-05-15",
    readTime: "6 min read",
    category: "Code Updates",
  },
  {
    slug: "pre-design-code-research",
    title: "Why Pre-Design Code Research Saves Weeks on Every Project",
    excerpt: "Most code surprises happen in design development or permit review — both expensive places to discover them. A systematic pre-design code check eliminates the most common sources of redesign.",
    date: "2025-04-28",
    readTime: "5 min read",
    category: "Practice",
  },
  {
    slug: "zoning-feasibility-checklist",
    title: "The Architect's Zoning Feasibility Checklist",
    excerpt: "Before committing to a site, these are the 12 zoning parameters you need to verify. Missing any one of them can invalidate your schematic design.",
    date: "2025-04-10",
    readTime: "8 min read",
    category: "Guides",
  },
  {
    slug: "ada-vs-ibc-accessibility",
    title: "ADA vs. IBC Accessibility: Understanding the Difference",
    excerpt: "ADA and IBC both govern accessibility, but they're not the same document and they don't always agree. Here's how to navigate the overlap and which takes precedence.",
    date: "2025-03-22",
    readTime: "7 min read",
    category: "Code Explainers",
  },
  {
    slug: "construction-type-selection",
    title: "How to Select the Right IBC Construction Type",
    excerpt: "Construction type selection is one of the most consequential early decisions in a project. It determines allowable height, area, and fire protection requirements. Here's a systematic approach.",
    date: "2025-03-05",
    readTime: "9 min read",
    category: "Code Explainers",
  },
  {
    slug: "permit-timeline-by-city",
    title: "Building Permit Timelines by City: 2025 Data",
    excerpt: "Permit timelines vary from 3 weeks in smaller cities to 30+ weeks in San Francisco. We compiled current data from 30 major US cities to help architects set realistic project schedules.",
    date: "2025-02-18",
    readTime: "4 min read",
    category: "Data",
  },
];

const CATEGORIES = ["All", "Code Updates", "Practice", "Guides", "Code Explainers", "Data"];

export default function BlogPage() {
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
            {[["/#how-it-works","How it works"],["/#features","Features"],["/codes","City Codes"],["/pricing","Pricing"]].map(([href,label]) => (
              <a key={label} href={href} className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>{label}</a>
            ))}
            <a href="/blog" className="text-xs tracking-wide" style={{ color: "#1c1a17", borderBottom: "1px solid #1c1a17", paddingBottom: "1px" }}>Blog</a>
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
          <div className="max-w-7xl mx-auto px-8 py-16">
            <p className="section-label mb-4" style={{ color: "rgba(245,242,238,0.4)" }}>Resources</p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight mb-4"
              style={{ color: "#f5f2ee", letterSpacing: "-0.02em", fontFamily: "var(--font-serif-display), Georgia, serif", fontWeight: 400 }}
            >
              Building Code Intelligence
            </h1>
            <p className="text-base max-w-xl" style={{ color: "rgba(245,242,238,0.5)", fontWeight: 300 }}>
              Guides, explainers, and data for architects navigating US building codes.
            </p>
          </div>
        </section>

        {/* ── Posts ── */}
        <section style={{ background: "var(--bg-base)" }}>
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {BLOG_POSTS.map((post, i) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block p-7 transition-colors group"
                  style={{
                    border: "1px solid var(--border-light)",
                    marginLeft: i % 3 !== 0 ? "-1px" : "0",
                    marginTop: i >= 3 ? "-1px" : "0",
                    background: "var(--bg-base)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-warm)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-base)")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[9px] font-semibold tracking-widest uppercase px-2 py-1"
                      style={{ background: "var(--bg-warm)", color: "var(--text-muted)", border: "1px solid var(--border-light)" }}
                    >
                      {post.category}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{post.readTime}</span>
                  </div>
                  <h2 className="text-sm font-medium leading-snug mb-3 group-hover:underline" style={{ color: "var(--text-primary)" }}>
                    {post.title}
                  </h2>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                    {post.excerpt}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </a>
              ))}
            </div>
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
