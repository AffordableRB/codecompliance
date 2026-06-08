"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
  zoningType: string;
  permitTimeline: string;
  lastUpdated: string;
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

function groupByState(cities: CityCodeData[]): Record<string, CityCodeData[]> {
  return cities.reduce((acc, city) => {
    if (!acc[city.state]) acc[city.state] = [];
    acc[city.state].push(city);
    return acc;
  }, {} as Record<string, CityCodeData[]>);
}

/* ═══════════════════════════════════════════
   IBC VERSION BADGE COLOR
   ═══════════════════════════════════════════ */
function ibcColor(version: string): string {
  if (version === "2022") return "#1c1a17";
  if (version === "2021") return "#3a3530";
  if (version === "2020") return "#5a5450";
  if (version === "2018") return "#7a7470";
  return "#9a9490";
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
  const isFiltering = search || stateFilter !== "All States" || ibcFilter !== "All Versions";

  return (
    <div style={{ background: "#f7f3ec", color: "#1c1a17", minHeight: "100vh", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      {/* ── Navigation ── */}
      <nav style={{ background: "#f7f3ec", borderBottom: "1px solid #ddd5c8", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{ width: "28px", height: "28px", border: "1px solid #1c1a17", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em", color: "#1c1a17" }}>CB</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1c1a17" }}>CodeBrief</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {[["/#how-it-works","How it works"],["/#features","Features"],["/codes","City Codes"],["/pricing","Pricing"]].map(([href,label]) => (
              <a key={label} href={href} style={{
                fontSize: "11px",
                letterSpacing: "0.04em",
                color: href === "/codes" ? "#1c1a17" : "#8a8078",
                textDecoration: href === "/codes" ? "none" : "none",
                borderBottom: href === "/codes" ? "1px solid #1c1a17" : "none",
                paddingBottom: href === "/codes" ? "1px" : "0",
              }}>{label}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <a href="/login" style={{ fontSize: "11px", letterSpacing: "0.04em", color: "#8a8078", textDecoration: "none" }}>Sign In</a>
            <a href="/#generate" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f7f3ec", background: "#1c1a17", padding: "8px 16px", textDecoration: "none" }}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* ── Search Hero ── */}
      <section style={{ padding: "80px 40px 64px", textAlign: "center", borderBottom: "1px solid #ddd5c8" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8078", marginBottom: "20px" }}>
            Code Directory
          </p>
          <h1 style={{
            fontFamily: "var(--font-serif-display), 'DM Serif Display', Georgia, serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "#1c1a17",
            marginBottom: "16px",
          }}>
            Building code requirements<br />for every US jurisdiction.
          </h1>
          <p style={{ fontSize: "15px", color: "#6b6258", lineHeight: 1.6, marginBottom: "40px", fontWeight: 300 }}>
            IBC adoption versions, permitting timelines, and zoning frameworks.<br />
            Free reference data for architects and developers.
          </p>

          {/* Search bar — the visual center */}
          <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto 16px" }}>
            <svg
              style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#8a8078" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or state..."
              style={{
                width: "100%",
                paddingLeft: "44px",
                paddingRight: "16px",
                paddingTop: "14px",
                paddingBottom: "14px",
                fontSize: "14px",
                background: "#ffffff",
                border: "1px solid #c8bfb4",
                color: "#1c1a17",
                outline: "none",
                boxSizing: "border-box",
                letterSpacing: "0.01em",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1c1a17"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(28,26,23,0.06)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#c8bfb4"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Inline filters */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              style={{
                padding: "8px 28px 8px 12px",
                fontSize: "11px",
                letterSpacing: "0.04em",
                background: "#f0ead e",
                border: "1px solid #c8bfb4",
                color: "#1c1a17",
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a8078' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={ibcFilter}
              onChange={(e) => setIbcFilter(e.target.value)}
              style={{
                padding: "8px 28px 8px 12px",
                fontSize: "11px",
                letterSpacing: "0.04em",
                background: "#f0eade",
                border: "1px solid #c8bfb4",
                color: "#1c1a17",
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a8078' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {ibcVersions.map((v) => <option key={v} value={v}>IBC {v}</option>)}
            </select>
            {isFiltering && (
              <button
                onClick={() => { setSearch(""); setStateFilter("All States"); setIbcFilter("All Versions"); }}
                style={{ padding: "8px 14px", fontSize: "11px", letterSpacing: "0.04em", background: "transparent", border: "1px solid #c8bfb4", color: "#8a8078", cursor: "pointer" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{ background: "#f0eade", borderBottom: "1px solid #ddd5c8", padding: "20px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "48px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", letterSpacing: "0.04em", color: "#6b6258" }}>
            <strong style={{ color: "#1c1a17", fontWeight: 600 }}>{filtered.length}</strong> {filtered.length === 1 ? "jurisdiction" : "jurisdictions"}
            {isFiltering ? " matching" : " in directory"}
          </span>
          <span style={{ fontSize: "11px", letterSpacing: "0.04em", color: "#6b6258" }}>
            <strong style={{ color: "#1c1a17", fontWeight: 600 }}>{sortedStates.length}</strong> states
          </span>
          <span style={{ fontSize: "11px", letterSpacing: "0.04em", color: "#6b6258" }}>
            Updated <strong style={{ color: "#1c1a17", fontWeight: 600 }}>Jan 2025</strong>
          </span>
          <span style={{ marginLeft: "auto", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8078" }}>
            Free reference data
          </span>
        </div>
      </section>

      {/* ── Directory Table ── */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px 80px" }}>

        {filtered.length === 0 ? (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <p style={{ fontSize: "15px", color: "#8a8078" }}>No jurisdictions match your search.</p>
            <button
              onClick={() => { setSearch(""); setStateFilter("All States"); setIbcFilter("All Versions"); }}
              style={{ marginTop: "16px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#1c1a17", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px 100px 120px 100px",
              padding: "16px 0 10px",
              borderBottom: "1px solid #1c1a17",
              marginTop: "40px",
            }}>
              {["Jurisdiction", "IBC", "IECC", "Zoning", "Permit Timeline", "ADA"].map((h) => (
                <span key={h} style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8a8078" }}>{h}</span>
              ))}
            </div>

            {/* State groups */}
            {sortedStates.map((state) => (
              <div key={state}>
                {/* State divider — drawing title block style */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "32px 0 0",
                  marginBottom: "0",
                }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8078", whiteSpace: "nowrap" }}>
                    {state}
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "#ddd5c8" }} />
                  <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#b8b0a8" }}>
                    {grouped[state].length} {grouped[state].length === 1 ? "city" : "cities"}
                  </span>
                </div>

                {/* City rows */}
                {grouped[state].map((city, idx) => (
                  <Link
                    key={city.slug}
                    href={`/codes/${city.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 100px 100px 100px 120px 100px",
                        padding: "14px 0",
                        borderBottom: `1px solid ${idx === grouped[state].length - 1 ? "transparent" : "#ede9e3"}`,
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f0eade"; e.currentTarget.style.marginLeft = "-40px"; e.currentTarget.style.marginRight = "-40px"; e.currentTarget.style.paddingLeft = "40px"; e.currentTarget.style.paddingRight = "40px"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.marginLeft = "0"; e.currentTarget.style.marginRight = "0"; e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.paddingRight = "0"; }}
                    >
                      {/* City name */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#1c1a17", letterSpacing: "0.01em" }}>
                          {city.city}
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", color: "#8a8078" }}>
                          {city.stateCode}
                        </span>
                      </div>

                      {/* IBC version */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          color: "#f7f3ec",
                          background: ibcColor(city.ibcVersion),
                          padding: "2px 7px",
                        }}>
                          {city.ibcVersion}
                        </span>
                      </div>

                      {/* IECC version */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#6b6258", letterSpacing: "0.02em" }}>
                          {city.ieccVersion}
                        </span>
                      </div>

                      {/* Zoning type */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#6b6258", letterSpacing: "0.02em" }}>
                          {city.zoningType}
                        </span>
                      </div>

                      {/* Permit timeline */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#6b6258", letterSpacing: "0.02em" }}>
                          {city.permitTimeline}
                        </span>
                      </div>

                      {/* ADA */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {city.adaAdopted ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="6" stroke="#1c1a17" strokeWidth="1"/>
                            <path d="M4 7l2 2 4-4" stroke="#1c1a17" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#b8b0a8" }}>—</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </>
        )}
      </main>

      {/* ── CTA Banner ── */}
      <section style={{ background: "#1c1a17", padding: "64px 40px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,242,238,0.4)", marginBottom: "16px" }}>
            Generate a Brief
          </p>
          <h2 style={{
            fontFamily: "var(--font-serif-display), 'DM Serif Display', Georgia, serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "#f5f2ee",
            marginBottom: "12px",
          }}>
            Need the full code analysis for your project?
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(245,242,238,0.5)", marginBottom: "32px", fontWeight: 300 }}>
            Enter your project parameters and get a complete compliance brief in 60 seconds.
          </p>
          <a href="/#generate" style={{
            display: "inline-block",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#1c1a17",
            background: "#f5f2ee",
            padding: "14px 32px",
            textDecoration: "none",
          }}>
            Generate a Brief
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#f0eade", borderTop: "1px solid #ddd5c8", padding: "32px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "22px", height: "22px", border: "1px solid #1c1a17", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "7px", fontWeight: 700, color: "#1c1a17" }}>CB</span>
            </div>
            <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6258" }}>CodeBrief</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[["/","Home"],["/codes","City Codes"],["/pricing","Pricing"],["/privacy","Privacy"],["/terms","Terms"]].map(([href,label]) => (
              <a key={label} href={href} style={{ fontSize: "10px", letterSpacing: "0.06em", color: "#8a8078", textDecoration: "none" }}>{label}</a>
            ))}
          </div>
          <span style={{ fontSize: "10px", letterSpacing: "0.04em", color: "#b8b0a8" }}>© 2025 CodeBrief</span>
        </div>
      </footer>

    </div>
  );
}
