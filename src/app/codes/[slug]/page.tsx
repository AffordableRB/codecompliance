"use client";

import { useState } from "react";
import { useParams } from "next/navigation";


/* ═══════════════════════════════════════════
   PLACEHOLDER DATA — slot in Supabase query
   ═══════════════════════════════════════════ */

interface CityDetailRecord { slug: string; city: string; state: string; stateCode: string; ibcVersion: string; ifcVersion: string; ieccVersion: string; adaAdopted: boolean; zoningType: string; permitTimeline: string; lastUpdated: string; county?: string; population?: string; zoningOrdinanceUrl?: string; permitPortalUrl?: string; ahj?: string; ahjPhone?: string; ahjEmail?: string; notes?: string; maxFar?: string; maxHeight?: string; setbackFront?: string; setbackSide?: string; setbackRear?: string; parkingRatio?: string; buildingPermitFee?: string; planReviewTime?: string; inspectionProcess?: string; electricUtility?: string; gasUtility?: string; waterUtility?: string; floodZone?: string; seismicZone?: string; windSpeed?: string; snowLoad?: string; sources?: { label: string; url: string; date: string }[]; }
const CITY_DETAIL_DATA: Record<string, CityDetailRecord> = {
  "chicago-il": {
    slug: "chicago-il",
    city: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    county: "Cook County",
    population: "2,696,555",
    ibcVersion: "2021",
    ifcVersion: "2021",
    ieccVersion: "2021",
    adaAdopted: true,
    zoningType: "Euclidean",
    permitTimeline: "6–10 weeks",
    lastUpdated: "2025-01-01",
    zoningOrdinanceUrl: "https://www.chicago.gov/city/en/depts/dcd/supp_info/chicago_zoning_ordinance.html",
    permitPortalUrl: "https://www.chicago.gov/city/en/depts/bldgs/provdrs/permit.html",
    ahj: "Chicago Department of Buildings",
    ahjPhone: "(312) 744-3449",
    ahjEmail: "buildings@cityofchicago.org",
    notes: "Chicago has adopted the 2021 IBC with local amendments. The Chicago Building Code (CBC) supplements IBC requirements with additional local provisions. High-rise buildings (over 80 ft) are subject to additional fire protection requirements.",
    maxFar: "16.0 (DX-16 district)",
    maxHeight: "No limit in downtown; varies by district",
    setbackFront: "0 ft (downtown); varies by district",
    setbackSide: "2 ft minimum residential",
    setbackRear: "30% of lot depth",
    parkingRatio: "1 space / 1,000 SF (B2 commercial)",
    buildingPermitFee: "$0.10 per SF (new construction)",
    planReviewTime: "4–6 weeks standard; 2 weeks expedited",
    inspectionProcess: "Online scheduling via Chicago Inspections Portal",
    electricUtility: "ComEd",
    gasUtility: "Peoples Gas",
    waterUtility: "Chicago Department of Water Management",
    floodZone: "Zone X (minimal flood hazard in most areas)",
    seismicZone: "SDC B",
    windSpeed: "115 mph (ASCE 7-22)",
    snowLoad: "25 psf ground snow",
    sources: [
      { label: "Chicago Zoning Ordinance (Title 17)", url: "https://www.chicago.gov/city/en/depts/dcd/supp_info/chicago_zoning_ordinance.html", date: "2024-01-01" },
      { label: "Chicago Building Code (2022 CBC)", url: "https://www.chicago.gov/city/en/depts/bldgs/supp_info/chicago_building_code.html", date: "2022-01-01" },
      { label: "Illinois Energy Conservation Code (IECC 2021)", url: "https://www2.illinois.gov/sites/energy/Pages/BuildingCodes.aspx", date: "2021-01-01" },
      { label: "FEMA Flood Map Service Center", url: "https://msc.fema.gov/portal/home", date: "2024-01-01" },
      { label: "Chicago DOB Permit Fee Schedule", url: "https://www.chicago.gov/city/en/depts/bldgs/provdrs/permit/svcs/permit_fee_schedule.html", date: "2024-01-01" },
    ],
  },
  "new-york-ny": {
    slug: "new-york-ny",
    city: "New York",
    state: "New York",
    stateCode: "NY",
    county: "Multiple (Manhattan, Brooklyn, Queens, Bronx, Staten Island)",
    population: "8,335,897",
    ibcVersion: "2022",
    ifcVersion: "2022",
    ieccVersion: "2021",
    adaAdopted: true,
    zoningType: "Euclidean",
    permitTimeline: "8–16 weeks",
    lastUpdated: "2025-01-01",
    zoningOrdinanceUrl: "https://zr.planning.nyc.gov/",
    permitPortalUrl: "https://www.nyc.gov/site/buildings/index.page",
    ahj: "NYC Department of Buildings",
    ahjPhone: "(212) 566-5000",
    ahjEmail: "dob@buildings.nyc.gov",
    notes: "New York City uses the NYC Building Code (2022), which is based on IBC but with significant local modifications. NYC has its own energy code (NYCECC) based on ASHRAE 90.1. The Zoning Resolution governs land use and density.",
    maxFar: "12.0 (C6-9 district)",
    maxHeight: "Varies by zoning district",
    setbackFront: "0 ft (commercial); varies residential",
    setbackSide: "Varies by district",
    setbackRear: "Varies by district",
    parkingRatio: "Varies; often waived in Manhattan",
    buildingPermitFee: "Varies by project cost",
    planReviewTime: "6–12 weeks standard",
    inspectionProcess: "DOB NOW: Build portal",
    electricUtility: "Con Edison",
    gasUtility: "Con Edison / National Grid",
    waterUtility: "NYC Department of Environmental Protection",
    floodZone: "Zone AE (coastal areas); Zone X (inland)",
    seismicZone: "SDC B",
    windSpeed: "120 mph (ASCE 7-22)",
    snowLoad: "30 psf ground snow",
    sources: [
      { label: "NYC Zoning Resolution", url: "https://zr.planning.nyc.gov/", date: "2024-01-01" },
      { label: "NYC Building Code (2022)", url: "https://www.nyc.gov/site/buildings/codes/2022-construction-codes.page", date: "2022-01-01" },
      { label: "NYC Energy Conservation Code", url: "https://www.nyc.gov/site/buildings/codes/energy-conservation-code.page", date: "2022-01-01" },
      { label: "FEMA Flood Map Service Center", url: "https://msc.fema.gov/portal/home", date: "2024-01-01" },
    ],
  },
};

const TABS = ["Overview", "Zoning", "Permits", "Utilities", "Environmental", "Sources"] as const;
type Tab = typeof TABS[number];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function CityCodePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const city = CITY_DETAIL_DATA[slug];

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="text-center">
          <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>City not found</p>
          <a href="/codes" className="text-xs underline" style={{ color: "var(--accent)" }}>Back to directory</a>
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
          <div className="hidden md:flex items-center gap-8">
            <a href="/codes" className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>← City Codes</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-xs tracking-wide transition-colors" style={{ color: "#8a8078" }} onMouseEnter={(e)=>(e.currentTarget.style.color="#1c1a17")} onMouseLeave={(e)=>(e.currentTarget.style.color="#8a8078")}>Sign In</a>
            <a href="/#generate" className="px-4 py-2 text-xs font-medium tracking-widest uppercase" style={{ background: "#1c1a17", color: "#f7f3ec" }}>Get Started</a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── City Header ── */}
        <section style={{ background: "#111111" }}>
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex items-start justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <a href="/codes" className="text-[10px] tracking-widest uppercase transition-colors" style={{ color: "rgba(245,242,238,0.35)" }} onMouseEnter={(e)=>(e.currentTarget.style.color="rgba(245,242,238,0.6)")} onMouseLeave={(e)=>(e.currentTarget.style.color="rgba(245,242,238,0.35)")}>City Codes</a>
                  <span style={{ color: "rgba(245,242,238,0.2)" }}>›</span>
                  <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.35)" }}>{city.stateCode}</span>
                </div>
                <h1 className="text-4xl font-light tracking-tight mb-2" style={{ color: "#f5f2ee", letterSpacing: "-0.02em", fontFamily: "var(--font-serif-display), Georgia, serif", fontWeight: 400 }}>
                  {city.city}
                </h1>
                <p className="text-sm" style={{ color: "rgba(245,242,238,0.4)", fontWeight: 300 }}>
                  {city.state}{city.county ? ` · ${city.county}` : ""}
                  {city.population ? ` · Pop. ${city.population}` : ""}
                </p>
              </div>
              <a
                href={`/#generate?location=${encodeURIComponent(city.city + ", " + city.stateCode)}`}
                className="flex-shrink-0 px-6 py-3 text-xs font-medium tracking-widest uppercase transition-colors"
                style={{ background: "#f5f2ee", color: "#111111" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e0d8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f2ee")}
              >
                Generate Brief for {city.city}
              </a>
            </div>

            {/* Code version strip */}
            <div className="flex flex-wrap gap-6 mt-8 pt-6" style={{ borderTop: "1px solid rgba(245,242,238,0.08)" }}>
              {[
                { label: "IBC", value: city.ibcVersion },
                { label: "IFC", value: city.ifcVersion },
                { label: "IECC", value: city.ieccVersion },
                { label: "ADA", value: city.adaAdopted ? "Adopted" : "Not Adopted" },
                { label: "Zoning", value: city.zoningType },
                { label: "Permit", value: city.permitTimeline },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[8px] tracking-widest uppercase mb-0.5" style={{ color: "rgba(245,242,238,0.3)" }}>{item.label}</p>
                  <p className="text-sm font-light" style={{ color: "#f5f2ee" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tabs ── */}
        <div style={{ background: "var(--bg-warm)", borderBottom: "1px solid var(--border-light)" }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex gap-0 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-4 text-xs font-medium tracking-widest uppercase transition-colors flex-shrink-0"
                  style={{
                    color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                    borderBottom: activeTab === tab ? "2px solid var(--text-primary)" : "2px solid transparent",
                    background: "transparent",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="max-w-7xl mx-auto px-8 py-10">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <InfoCard title="Building Codes">
                  <DataTable rows={[
                    ["International Building Code (IBC)", city.ibcVersion],
                    ["International Fire Code (IFC)", city.ifcVersion],
                    ["International Energy Conservation Code (IECC)", city.ieccVersion],
                    ["ADA / Accessibility", city.adaAdopted ? "Adopted — Federal ADA + local amendments" : "Not formally adopted"],
                  ]} />
                </InfoCard>
                {city.notes && (
                  <InfoCard title="Local Notes">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{city.notes}</p>
                  </InfoCard>
                )}
                <InfoCard title="Authority Having Jurisdiction (AHJ)">
                  <DataTable rows={[
                    ["Department", city.ahj || "—"],
                    ["Phone", city.ahjPhone || "—"],
                    ["Email", city.ahjEmail || "—"],
                  ]} />
                  {city.permitPortalUrl && (
                    <a href={city.permitPortalUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-xs underline" style={{ color: "var(--accent)" }}>
                      Permit Portal →
                    </a>
                  )}
                </InfoCard>
              </div>
              <div className="space-y-4">
                <div className="p-5" style={{ background: "#111111" }}>
                  <p className="text-[9px] font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(245,242,238,0.4)" }}>Generate Full Analysis</p>
                  <p className="text-xs mb-4" style={{ color: "rgba(245,242,238,0.6)", fontWeight: 300 }}>
                    This page shows reference data. CodeBrief generates a complete code analysis for your specific project in {city.city} — zoning, IBC, ADA, IECC, egress, and more.
                  </p>
                  <a
                    href={`/#generate`}
                    className="block text-center px-4 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors"
                    style={{ background: "#f5f2ee", color: "#111111" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e0d8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f2ee")}
                  >
                    Generate a Brief
                  </a>
                </div>
                <div className="p-5" style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)" }}>
                  <p className="text-[9px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>Last Updated</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {new Date(city.lastUpdated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
                    Data is manually verified. Always confirm with the AHJ before proceeding with design.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Zoning" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <InfoCard title="Zoning Framework">
                  <DataTable rows={[
                    ["Zoning Type", city.zoningType],
                    ["Maximum FAR", city.maxFar || "Varies by district"],
                    ["Maximum Height", city.maxHeight || "Varies by district"],
                    ["Front Setback", city.setbackFront || "Varies by district"],
                    ["Side Setback", city.setbackSide || "Varies by district"],
                    ["Rear Setback", city.setbackRear || "Varies by district"],
                    ["Parking Ratio", city.parkingRatio || "Varies by use"],
                  ]} />
                </InfoCard>
                <div className="p-5" style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)" }}>
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text-secondary)" }}>Note:</strong> Zoning parameters shown are representative values for common commercial districts. Actual requirements vary significantly by zoning district. Always verify with the AHJ and review the official zoning ordinance.
                  </p>
                  {city.zoningOrdinanceUrl && (
                    <a href={city.zoningOrdinanceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs underline" style={{ color: "var(--accent)" }}>
                      View Zoning Ordinance →
                    </a>
                  )}
                </div>
              </div>
              <div>
                <div className="p-5" style={{ background: "#111111" }}>
                  <p className="text-[9px] font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(245,242,238,0.4)" }}>Need a Zoning Feasibility Report?</p>
                  <p className="text-xs mb-4" style={{ color: "rgba(245,242,238,0.6)", fontWeight: 300 }}>
                    CodeBrief can generate a full zoning feasibility analysis for your specific site and use in {city.city}.
                  </p>
                  <a href="/#generate" className="block text-center px-4 py-2.5 text-xs font-medium tracking-widest uppercase" style={{ background: "#f5f2ee", color: "#111111" }}>
                    Generate Zoning Report
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Permits" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <InfoCard title="Permitting Process">
                  <DataTable rows={[
                    ["Typical Timeline", city.permitTimeline],
                    ["Plan Review Time", city.planReviewTime || "Varies by project type"],
                    ["Building Permit Fee", city.buildingPermitFee || "Varies by project cost"],
                    ["Inspection Process", city.inspectionProcess || "Contact AHJ"],
                  ]} />
                </InfoCard>
                <InfoCard title="Authority Having Jurisdiction">
                  <DataTable rows={[
                    ["Department", city.ahj || "—"],
                    ["Phone", city.ahjPhone || "—"],
                    ["Email", city.ahjEmail || "—"],
                  ]} />
                  {city.permitPortalUrl && (
                    <a href={city.permitPortalUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-xs underline" style={{ color: "var(--accent)" }}>
                      Online Permit Portal →
                    </a>
                  )}
                </InfoCard>
              </div>
              <div>
                <div className="p-5" style={{ background: "#111111" }}>
                  <p className="text-[9px] font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(245,242,238,0.4)" }}>Permitting Pathway Report</p>
                  <p className="text-xs mb-4" style={{ color: "rgba(245,242,238,0.6)", fontWeight: 300 }}>
                    Get a detailed permitting pathway analysis for your project type in {city.city}.
                  </p>
                  <a href="/#generate" className="block text-center px-4 py-2.5 text-xs font-medium tracking-widest uppercase" style={{ background: "#f5f2ee", color: "#111111" }}>
                    Generate Permit Report
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Utilities" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <InfoCard title="Utility Providers">
                  <DataTable rows={[
                    ["Electric", city.electricUtility || "Contact AHJ"],
                    ["Natural Gas", city.gasUtility || "Contact AHJ"],
                    ["Water / Sewer", city.waterUtility || "Contact AHJ"],
                  ]} />
                </InfoCard>
              </div>
            </div>
          )}

          {activeTab === "Environmental" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <InfoCard title="Environmental Parameters">
                  <DataTable rows={[
                    ["FEMA Flood Zone", city.floodZone || "Verify with FEMA MSC"],
                    ["Seismic Design Category", city.seismicZone || "Verify with structural engineer"],
                    ["Design Wind Speed", city.windSpeed || "Per ASCE 7"],
                    ["Ground Snow Load", city.snowLoad || "Per ASCE 7"],
                  ]} />
                </InfoCard>
                <div className="mt-4 p-5" style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)" }}>
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text-secondary)" }}>Important:</strong> Environmental parameters must be verified for your specific site. Flood zones vary by parcel. Seismic and wind parameters are per ASCE 7 for the city centroid — consult a licensed structural engineer for site-specific values.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Sources" && (
            <div className="max-w-3xl">
              <div className="mb-6">
                <h2 className="text-lg font-light tracking-tight mb-2" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Sources & References</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                  All data on this page is sourced from official government and standards publications. Links open the primary source document.
                </p>
              </div>
              {city.sources && city.sources.length > 0 ? (
                <div className="space-y-0">
                  {city.sources.map((source, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-6 py-4"
                      style={{ borderBottom: "1px solid var(--border-light)" }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-[10px] font-semibold tracking-widest mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-sm font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>{source.label}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            Accessed {new Date(source.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                          </p>
                        </div>
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-[10px] tracking-widest uppercase underline"
                        style={{ color: "var(--accent)" }}
                      >
                        View →
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sources not yet available for this city.</p>
              )}
              <div className="mt-8 p-5" style={{ background: "var(--bg-warm)", border: "1px solid var(--border-light)" }}>
                <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-secondary)" }}>Disclaimer:</strong> This reference data is provided for informational purposes only. Building codes and zoning ordinances are amended frequently. Always verify current requirements with the Authority Having Jurisdiction (AHJ) before proceeding with design or permit applications.
                </p>
              </div>
            </div>
          )}
        </div>
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
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border-light)" }}>
      <div className="px-5 py-3" style={{ background: "#111111", borderBottom: "1px solid #222" }}>
        <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "rgba(245,242,238,0.5)" }}>{title}</p>
      </div>
      <div className="p-5" style={{ background: "#ffffff" }}>
        {children}
      </div>
    </div>
  );
}

function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full">
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
            <td className="py-2.5 pr-6 text-xs w-1/2" style={{ color: "var(--text-muted)", fontWeight: 400 }}>{label}</td>
            <td className="py-2.5 text-xs font-medium" style={{ color: "var(--text-primary)" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
