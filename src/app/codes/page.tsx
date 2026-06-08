"use client";

import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

export interface CityCodeData {
  slug: string;
  city: string;
  state: string;
  stateCode: string;
  ibcVersion: string;
  ifcVersion: string;
  ieccVersion: string;
  adaAdopted: boolean;
  zoningType: string; // e.g. "Euclidean", "Form-Based", "Hybrid"
  permitTimeline: string; // e.g. "4–6 weeks"
  lastUpdated: string; // ISO date string
}

/* ═══════════════════════════════════════════
   PLACEHOLDER DATA
   Replace with your Supabase query when ready.
   The shape above is the contract.
   ═══════════════════════════════════════════ */

const PLACEHOLDER_CITIES: CityCodeData[] = [
  { slug: "new-york-ny", city: "New York", state: "New York", stateCode: "NY", ibcVersion: "2022", ifcVersion: "2022", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "8–16 weeks", lastUpdated: "2025-01-01" },
  { slug: "los-angeles-ca", city: "Los Angeles", state: "California", stateCode: "CA", ibcVersion: "2022", ifcVersion: "2022", ieccVersion: "2022", adaAdopted: true, zoningType: "Form-Based", permitTimeline: "12–20 weeks", lastUpdated: "2025-01-01" },
  { slug: "chicago-il", city: "Chicago", state: "Illinois", stateCode: "IL", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "6–10 weeks", lastUpdated: "2025-01-01" },
  { slug: "houston-tx", city: "Houston", state: "Texas", stateCode: "TX", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "None", permitTimeline: "4–8 weeks", lastUpdated: "2025-01-01" },
  { slug: "phoenix-az", city: "Phoenix", state: "Arizona", stateCode: "AZ", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–6 weeks", lastUpdated: "2025-01-01" },
  { slug: "philadelphia-pa", city: "Philadelphia", state: "Pennsylvania", stateCode: "PA", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Hybrid", permitTimeline: "6–12 weeks", lastUpdated: "2025-01-01" },
  { slug: "san-antonio-tx", city: "San Antonio", state: "Texas", stateCode: "TX", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–6 weeks", lastUpdated: "2025-01-01" },
  { slug: "san-diego-ca", city: "San Diego", state: "California", stateCode: "CA", ibcVersion: "2022", ifcVersion: "2022", ieccVersion: "2022", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "8–14 weeks", lastUpdated: "2025-01-01" },
  { slug: "dallas-tx", city: "Dallas", state: "Texas", stateCode: "TX", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–8 weeks", lastUpdated: "2025-01-01" },
  { slug: "san-jose-ca", city: "San Jose", state: "California", stateCode: "CA", ibcVersion: "2022", ifcVersion: "2022", ieccVersion: "2022", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "10–18 weeks", lastUpdated: "2025-01-01" },
  { slug: "austin-tx", city: "Austin", state: "Texas", stateCode: "TX", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "6–10 weeks", lastUpdated: "2025-01-01" },
  { slug: "jacksonville-fl", city: "Jacksonville", state: "Florida", stateCode: "FL", ibcVersion: "2020", ifcVersion: "2020", ieccVersion: "2020", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–6 weeks", lastUpdated: "2025-01-01" },
  { slug: "fort-worth-tx", city: "Fort Worth", state: "Texas", stateCode: "TX", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–6 weeks", lastUpdated: "2025-01-01" },
  { slug: "columbus-oh", city: "Columbus", state: "Ohio", stateCode: "OH", ibcVersion: "2017", ifcVersion: "2017", ieccVersion: "2017", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–8 weeks", lastUpdated: "2025-01-01" },
  { slug: "charlotte-nc", city: "Charlotte", state: "North Carolina", stateCode: "NC", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–8 weeks", lastUpdated: "2025-01-01" },
  { slug: "indianapolis-in", city: "Indianapolis", state: "Indiana", stateCode: "IN", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "3–6 weeks", lastUpdated: "2025-01-01" },
  { slug: "san-francisco-ca", city: "San Francisco", state: "California", stateCode: "CA", ibcVersion: "2022", ifcVersion: "2022", ieccVersion: "2022", adaAdopted: true, zoningType: "Form-Based", permitTimeline: "16–30 weeks", lastUpdated: "2025-01-01" },
  { slug: "seattle-wa", city: "Seattle", state: "Washington", stateCode: "WA", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Hybrid", permitTimeline: "8–16 weeks", lastUpdated: "2025-01-01" },
  { slug: "denver-co", city: "Denver", state: "Colorado", stateCode: "CO", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Form-Based", permitTimeline: "6–12 weeks", lastUpdated: "2025-01-01" },
  { slug: "nashville-tn", city: "Nashville", state: "Tennessee", stateCode: "TN", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–8 weeks", lastUpdated: "2025-01-01" },
  { slug: "oklahoma-city-ok", city: "Oklahoma City", state: "Oklahoma", stateCode: "OK", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "3–5 weeks", lastUpdated: "2025-01-01" },
  { slug: "el-paso-tx", city: "El Paso", state: "Texas", stateCode: "TX", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "3–5 weeks", lastUpdated: "2025-01-01" },
  { slug: "washington-dc", city: "Washington", state: "District of Columbia", stateCode: "DC", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Form-Based", permitTimeline: "10–20 weeks", lastUpdated: "2025-01-01" },
  { slug: "las-vegas-nv", city: "Las Vegas", state: "Nevada", stateCode: "NV", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–8 weeks", lastUpdated: "2025-01-01" },
  { slug: "louisville-ky", city: "Louisville", state: "Kentucky", stateCode: "KY", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–6 weeks", lastUpdated: "2025-01-01" },
  { slug: "memphis-tn", city: "Memphis", state: "Tennessee", stateCode: "TN", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "3–5 weeks", lastUpdated: "2025-01-01" },
  { slug: "portland-or", city: "Portland", state: "Oregon", stateCode: "OR", ibcVersion: "2021", ifcVersion: "2021", ieccVersion: "2021", adaAdopted: true, zoningType: "Form-Based", permitTimeline: "8–16 weeks", lastUpdated: "2025-01-01" },
  { slug: "baltimore-md", city: "Baltimore", state: "Maryland", stateCode: "MD", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "6–10 weeks", lastUpdated: "2025-01-01" },
  { slug: "milwaukee-wi", city: "Milwaukee", state: "Wisconsin", stateCode: "WI", ibcVersion: "2015", ifcVersion: "2015", ieccVersion: "2015", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "4–8 weeks", lastUpdated: "2025-01-01" },
  { slug: "albuquerque-nm", city: "Albuquerque", state: "New Mexico", stateCode: "NM", ibcVersion: "2018", ifcVersion: "2018", ieccVersion: "2018", adaAdopted: true, zoningType: "Euclidean", permitTimeline: "3–6 weeks", lastUpdated: "2025-01-01" },
];

// Group cities by state
function groupByState(cities: CityCodeData[]): Record<string, CityCodeData[]> {
  return cities.reduce((acc, city) => {
    if (!acc[city.state]) acc[city.state] = [];
    acc[city.state].push(city);
    return acc;
  }, {} as Record<string, CityCodeData[]>);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function CodesDirectory() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [ibcFilter, setIbcFilter] = useState("All Versions");

  const cities = PLACEHOLDER_CITIES;

  const states = useMemo(() => {
    const s = Array.from(new Set(cities.map((c) => c.state))).sort();
    return ["All States", ...s];
  }, [cities]);

  const ibcVersions = useMemo(() => {
    const v = Array.from(new Set(cities.map((c) => c.ibcVersion))).sort().reverse();
    return ["All Versions", ...v];
  }, [cities]);

  const filtered = useMemo(() => {
    return cities.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.stateCode.toLowerCase().includes(q);
      const matchState = stateFilter === "All States" || c.state === stateFilter;
      const matchIbc = ibcFilter === "All Versions" || c.ibcVersion === ibcFilter;
      return matchSearch && matchState && matchIbc;
    });
  }, [cities, search, stateFilter, ibcFilter]);

  const grouped = useMemo(() => groupByState(filtered), [filtered]);
  const sortedStates = Object.keys(grouped).sort();

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50"
        style={{ background: "#f7f3ec", borderBottom: "1px solid #ddd5c8" }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ border: "1px solid #1c1a17" }}>
              <span className="text-[10px] font-bold tracking-tight" style={{ color: "#1c1a17" }}>CB</span>
            </div>
            <span className="text-sm font-medium tracking-widest uppercase" style={{ color: "#1c1a17", letterSpacing: "0.12em" }}>CodeBrief</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[["/#how-it-works","How it works"],["/#features","Features"],["/#pricing","Pricing"],["/#faq","FAQ"]].map(([href,label]) => (
              <a key={label} href={href} className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>{label}</a>
            ))}
            <a href="/codes" className="text-xs tracking-wide" style={{ color: "#1c1a17", borderBottom: "1px solid #1c1a17", paddingBottom: "1px" }}>City Codes</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>Sign In</a>
            <a href="/#generate" className="px-4 py-2 text-xs font-medium tracking-widest uppercase" style={{ background: "#1c1a17", color: "#f7f3ec" }}>Get Started</a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Page Header ── */}
        <section style={{ background: "#111111" }}>
          <div className="max-w-7xl mx-auto px-8 py-16">
            <p className="section-label mb-4" style={{ color: "rgba(245,242,238,0.4)" }}>Code Directory</p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight mb-4"
              style={{ color: "#f5f2ee", letterSpacing: "-0.02em", fontFamily: "var(--font-serif-display), Georgia, serif", fontWeight: 400 }}
            >
              City Code Directory
            </h1>
            <p className="text-base max-w-2xl" style={{ color: "rgba(245,242,238,0.5)", fontWeight: 300 }}>
              IBC adoption versions, permitting timelines, and zoning frameworks for major US cities.
              Free reference data for architects and developers.
            </p>
            <div className="flex flex-wrap gap-8 mt-8 pt-6" style={{ borderTop: "1px solid rgba(245,242,238,0.08)" }}>
              {[
                { value: `${cities.length}+`, label: "Cities" },
                { value: "50", label: "States" },
                { value: "Free", label: "Always" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-light tracking-tight" style={{ color: "#f5f2ee", letterSpacing: "-0.02em" }}>{s.value}</p>
                  <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "rgba(245,242,238,0.3)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Search & Filters ── */}
        <section style={{ background: "var(--bg-warm)", borderBottom: "1px solid var(--border-light)" }}>
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city or state..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm"
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--text-primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-medium)")}
                />
              </div>
              {/* State filter */}
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="px-3 py-2.5 text-sm"
                style={{ background: "#ffffff", border: "1px solid var(--border-medium)", color: "var(--text-primary)", minWidth: "160px" }}
              >
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* IBC filter */}
              <select
                value={ibcFilter}
                onChange={(e) => setIbcFilter(e.target.value)}
                className="px-3 py-2.5 text-sm"
                style={{ background: "#ffffff", border: "1px solid var(--border-medium)", color: "var(--text-primary)", minWidth: "160px" }}
              >
                {ibcVersions.map((v) => <option key={v} value={v}>IBC {v}</option>)}
              </select>
            </div>
            {/* Result count */}
            <p className="text-[10px] tracking-wide mt-3" style={{ color: "var(--text-muted)" }}>
              Showing {filtered.length} of {cities.length} cities
              {search && ` matching "${search}"`}
            </p>
          </div>
        </section>

        {/* ── City Grid ── */}
        <section style={{ background: "var(--bg-base)" }}>
          <div className="max-w-7xl mx-auto px-8 py-12">
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No cities match your search.</p>
                <button
                  onClick={() => { setSearch(""); setStateFilter("All States"); setIbcFilter("All Versions"); }}
                  className="mt-4 text-xs underline"
                  style={{ color: "var(--accent)" }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {sortedStates.map((state) => (
                  <div key={state}>
                    <div className="flex items-center gap-4 mb-4">
                      <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{state}</p>
                      <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
                      <p className="text-[10px]" style={{ color: "var(--border-medium)" }}>{grouped[state].length} {grouped[state].length === 1 ? "city" : "cities"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                      {grouped[state].map((city, i) => (
                        <a
                          key={city.slug}
                          href={`/codes/${city.slug}`}
                          className="block p-6 transition-colors group"
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
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-sm font-medium mb-0.5 group-hover:underline" style={{ color: "var(--text-primary)" }}>
                                {city.city}
                              </h3>
                              <p className="text-[10px] tracking-wide" style={{ color: "var(--text-muted)" }}>{city.stateCode}</p>
                            </div>
                            <svg className="w-3.5 h-3.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <CodeBadge label="IBC" value={city.ibcVersion} />
                            <CodeBadge label="IECC" value={city.ieccVersion} />
                            <CodeBadge label="Permit" value={city.permitTimeline} small />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: "#111111", borderTop: "1px solid #222" }}>
          <div className="max-w-7xl mx-auto px-8 py-16 text-center">
            <p className="section-label mb-4" style={{ color: "rgba(245,242,238,0.4)" }}>For Architects</p>
            <h2 className="text-3xl font-light tracking-tight mb-4" style={{ color: "#f5f2ee", letterSpacing: "-0.02em" }}>
              Need a full code analysis for your project?
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(245,242,238,0.4)", fontWeight: 300 }}>
              City pages show reference data. CodeBrief generates a complete analysis — zoning, IBC, ADA, IECC, egress, and more — in 60 seconds.
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

/* ── Sub-components ── */
function CodeBadge({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="px-2 py-1.5" style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)" }}>
      <p className="text-[8px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className={`font-medium ${small ? "text-[9px]" : "text-[10px]"}`} style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}
