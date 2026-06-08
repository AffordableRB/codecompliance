'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';

/* ─── Data layer ─────────────────────────────────────────────────────────── */
// Slot your database records in here — same shape, just replace the array.
export interface CityRecord {
  slug: string;
  city: string;
  state: string;
  stateCode: string;
  ibc: string;
  iecc: string;
  zoning: string;
  permitWeeks: string;
  ada: boolean;
  population?: string;
}

const CITIES: CityRecord[] = [
  { slug: 'phoenix-az',       city: 'Phoenix',       state: 'Arizona',              stateCode: 'AZ', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '4–6 wks',   ada: true,  population: '1.6M' },
  { slug: 'los-angeles-ca',   city: 'Los Angeles',   state: 'California',           stateCode: 'CA', ibc: '2022', iecc: '2022', zoning: 'Form-Based', permitWeeks: '12–20 wks', ada: true,  population: '3.9M' },
  { slug: 'san-diego-ca',     city: 'San Diego',     state: 'California',           stateCode: 'CA', ibc: '2022', iecc: '2022', zoning: 'Euclidean',  permitWeeks: '8–14 wks',  ada: true,  population: '1.4M' },
  { slug: 'san-jose-ca',      city: 'San Jose',      state: 'California',           stateCode: 'CA', ibc: '2022', iecc: '2022', zoning: 'Euclidean',  permitWeeks: '10–18 wks', ada: true,  population: '1.0M' },
  { slug: 'san-francisco-ca', city: 'San Francisco', state: 'California',           stateCode: 'CA', ibc: '2022', iecc: '2022', zoning: 'Form-Based', permitWeeks: '16–30 wks', ada: true,  population: '874K' },
  { slug: 'denver-co',        city: 'Denver',        state: 'Colorado',             stateCode: 'CO', ibc: '2021', iecc: '2021', zoning: 'Form-Based', permitWeeks: '6–12 wks',  ada: true,  population: '715K' },
  { slug: 'washington-dc',    city: 'Washington',    state: 'District of Columbia', stateCode: 'DC', ibc: '2021', iecc: '2021', zoning: 'Form-Based', permitWeeks: '10–20 wks', ada: true,  population: '689K' },
  { slug: 'jacksonville-fl',  city: 'Jacksonville',  state: 'Florida',              stateCode: 'FL', ibc: '2020', iecc: '2020', zoning: 'Euclidean',  permitWeeks: '4–6 wks',   ada: true,  population: '949K' },
  { slug: 'chicago-il',       city: 'Chicago',       state: 'Illinois',             stateCode: 'IL', ibc: '2021', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '6–10 wks',  ada: true,  population: '2.7M' },
  { slug: 'indianapolis-in',  city: 'Indianapolis',  state: 'Indiana',              stateCode: 'IN', ibc: '2021', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '3–6 wks',   ada: true,  population: '887K' },
  { slug: 'louisville-ky',    city: 'Louisville',    state: 'Kentucky',             stateCode: 'KY', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '4–6 wks',   ada: true,  population: '633K' },
  { slug: 'baltimore-md',     city: 'Baltimore',     state: 'Maryland',             stateCode: 'MD', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '6–10 wks',  ada: true,  population: '585K' },
  { slug: 'las-vegas-nv',     city: 'Las Vegas',     state: 'Nevada',               stateCode: 'NV', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '4–8 wks',   ada: true,  population: '641K' },
  { slug: 'albuquerque-nm',   city: 'Albuquerque',   state: 'New Mexico',           stateCode: 'NM', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '3–6 wks',   ada: true,  population: '564K' },
  { slug: 'new-york-ny',      city: 'New York',      state: 'New York',             stateCode: 'NY', ibc: '2022', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '8–16 wks',  ada: true,  population: '8.3M' },
  { slug: 'charlotte-nc',     city: 'Charlotte',     state: 'North Carolina',       stateCode: 'NC', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '4–8 wks',   ada: true,  population: '874K' },
  { slug: 'columbus-oh',      city: 'Columbus',      state: 'Ohio',                 stateCode: 'OH', ibc: '2017', iecc: '2017', zoning: 'Euclidean',  permitWeeks: '4–8 wks',   ada: true,  population: '898K' },
  { slug: 'oklahoma-city-ok', city: 'Oklahoma City', state: 'Oklahoma',             stateCode: 'OK', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '3–5 wks',   ada: true,  population: '681K' },
  { slug: 'portland-or',      city: 'Portland',      state: 'Oregon',               stateCode: 'OR', ibc: '2021', iecc: '2021', zoning: 'Form-Based', permitWeeks: '8–16 wks',  ada: true,  population: '652K' },
  { slug: 'philadelphia-pa',  city: 'Philadelphia',  state: 'Pennsylvania',         stateCode: 'PA', ibc: '2018', iecc: '2018', zoning: 'Hybrid',     permitWeeks: '6–12 wks',  ada: true,  population: '1.6M' },
  { slug: 'nashville-tn',     city: 'Nashville',     state: 'Tennessee',            stateCode: 'TN', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '4–8 wks',   ada: true,  population: '689K' },
  { slug: 'memphis-tn',       city: 'Memphis',       state: 'Tennessee',            stateCode: 'TN', ibc: '2018', iecc: '2018', zoning: 'Euclidean',  permitWeeks: '3–5 wks',   ada: true,  population: '633K' },
  { slug: 'houston-tx',       city: 'Houston',       state: 'Texas',                stateCode: 'TX', ibc: '2021', iecc: '2021', zoning: 'None',       permitWeeks: '4–8 wks',   ada: true,  population: '2.3M' },
  { slug: 'san-antonio-tx',   city: 'San Antonio',   state: 'Texas',                stateCode: 'TX', ibc: '2021', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '4–6 wks',   ada: true,  population: '1.4M' },
  { slug: 'dallas-tx',        city: 'Dallas',        state: 'Texas',                stateCode: 'TX', ibc: '2021', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '4–8 wks',   ada: true,  population: '1.3M' },
  { slug: 'austin-tx',        city: 'Austin',        state: 'Texas',                stateCode: 'TX', ibc: '2021', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '6–10 wks',  ada: true,  population: '961K' },
  { slug: 'fort-worth-tx',    city: 'Fort Worth',    state: 'Texas',                stateCode: 'TX', ibc: '2021', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '4–6 wks',   ada: true,  population: '918K' },
  { slug: 'el-paso-tx',       city: 'El Paso',       state: 'Texas',                stateCode: 'TX', ibc: '2021', iecc: '2021', zoning: 'Euclidean',  permitWeeks: '3–5 wks',   ada: true,  population: '678K' },
  { slug: 'seattle-wa',       city: 'Seattle',       state: 'Washington',           stateCode: 'WA', ibc: '2021', iecc: '2021', zoning: 'Hybrid',     permitWeeks: '8–16 wks',  ada: true,  population: '737K' },
  { slug: 'milwaukee-wi',     city: 'Milwaukee',     state: 'Wisconsin',            stateCode: 'WI', ibc: '2015', iecc: '2015', zoning: 'Euclidean',  permitWeeks: '4–8 wks',   ada: true,  population: '577K' },
];

const IBC_VERSION_COLOR: Record<string, string> = {
  '2022': '#111111',
  '2021': '#2d2d2d',
  '2020': '#4a4a4a',
  '2018': '#6b6b6b',
  '2017': '#8a8a8a',
  '2015': '#aaaaaa',
};

const ZONING_COLOR: Record<string, string> = {
  'Form-Based': '#1a4a8a',
  'Euclidean':  '#2d6b2d',
  'Hybrid':     '#7a4a00',
  'None':       '#8a2d2d',
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CodesPage() {
  const [query, setQuery]           = useState('');
  const [activeState, setActiveState] = useState<string | null>(null);
  const [ibcFilter, setIbcFilter]   = useState('');
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filtered cities
  const filtered = useMemo(() => {
    return CITIES.filter(c => {
      const q = query.toLowerCase();
      const matchQ = !q || c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.stateCode.toLowerCase().includes(q);
      const matchState = !activeState || c.state === activeState;
      const matchIbc = !ibcFilter || c.ibc === ibcFilter;
      return matchQ && matchState && matchIbc;
    });
  }, [query, activeState, ibcFilter]);

  // Group by state
  const grouped = useMemo(() => {
    const map: Record<string, CityRecord[]> = {};
    filtered.forEach(c => {
      if (!map[c.state]) map[c.state] = [];
      map[c.state].push(c);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const allStates = useMemo(() => {
    const s = new Set(CITIES.map(c => c.state));
    return Array.from(s).sort();
  }, []);

  const ibcVersions = useMemo(() => {
    const v = new Set(CITIES.map(c => c.ibc));
    return Array.from(v).sort((a, b) => Number(b) - Number(a));
  }, []);

  function scrollToState(state: string) {
    setActiveState(state);
    setQuery('');
    setTimeout(() => {
      sectionRefs.current[state]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>

      {/* ── Nav ── */}
      <nav style={{ background: 'var(--bg-base, #f7f3ec)', borderBottom: '1px solid var(--border, #e0d8cc)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, border: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: '#1a1a1a' }}>CB</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: '#1a1a1a', textTransform: 'uppercase' }}>CodeBrief</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/#how-it-works" style={{ fontSize: 13, color: '#555', textDecoration: 'none', letterSpacing: '0.02em' }}>How it works</Link>
            <Link href="/#features"     style={{ fontSize: 13, color: '#555', textDecoration: 'none', letterSpacing: '0.02em' }}>Features</Link>
            <Link href="/codes"         style={{ fontSize: 13, color: '#1a1a1a', textDecoration: 'none', letterSpacing: '0.02em', fontWeight: 600 }}>City Codes</Link>
            <Link href="/pricing"       style={{ fontSize: 13, color: '#555', textDecoration: 'none', letterSpacing: '0.02em' }}>Pricing</Link>
            <Link href="/login"         style={{ fontSize: 13, color: '#555', textDecoration: 'none', letterSpacing: '0.02em' }}>Sign In</Link>
            <Link href="/#generate"     style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', background: '#1a1a1a', padding: '8px 18px', textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Page header ── */}
      <div style={{ borderBottom: '1px solid #e8e8e8', background: '#fff', padding: '40px 0 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 10px' }}>Code Directory</p>
              <h1 style={{ fontFamily: 'var(--font-dm-serif, Georgia, serif)', fontSize: 36, fontWeight: 400, color: '#111', margin: '0 0 10px', lineHeight: 1.15 }}>
                US Jurisdiction Reference
              </h1>
              <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6 }}>
                IBC adoption, permitting timelines, and zoning frameworks for {CITIES.length} US cities.
              </p>
            </div>
            {/* Search */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search city or state…"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveState(null); }}
                  style={{ paddingLeft: 36, paddingRight: 14, height: 38, border: '1px solid #ddd', fontSize: 13, color: '#111', outline: 'none', width: 240, background: '#fff' }}
                />
              </div>
              <select value={ibcFilter} onChange={e => setIbcFilter(e.target.value)}
                style={{ height: 38, border: '1px solid #ddd', fontSize: 13, color: '#555', padding: '0 12px', background: '#fff', cursor: 'pointer' }}>
                <option value="">All IBC Versions</option>
                {ibcVersions.map(v => <option key={v} value={v}>IBC {v}</option>)}
              </select>
              {/* View toggle */}
              <div style={{ display: 'flex', border: '1px solid #ddd', overflow: 'hidden' }}>
                <button onClick={() => setViewMode('grid')}
                  style={{ width: 38, height: 38, border: 'none', background: viewMode === 'grid' ? '#111' : '#fff', color: viewMode === 'grid' ? '#fff' : '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button onClick={() => setViewMode('list')}
                  style={{ width: 38, height: 38, border: 'none', borderLeft: '1px solid #ddd', background: viewMode === 'list' ? '#111' : '#fff', color: viewMode === 'list' ? '#fff' : '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 32, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: 12, color: '#999' }}><strong style={{ color: '#111', fontWeight: 600 }}>{filtered.length}</strong> jurisdictions</span>
            <span style={{ fontSize: 12, color: '#999' }}><strong style={{ color: '#111', fontWeight: 600 }}>{grouped.length}</strong> states</span>
            <span style={{ fontSize: 12, color: '#999' }}>Updated <strong style={{ color: '#111', fontWeight: 600 }}>Jan 2025</strong></span>
            <span style={{ fontSize: 12, color: '#2d6b2d', fontWeight: 500 }}>Free reference data</span>
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 0, alignItems: 'flex-start' }}>

        {/* Left: State index */}
        <aside style={{ width: 200, flexShrink: 0, position: 'sticky', top: 57, maxHeight: 'calc(100vh - 57px)', overflowY: 'auto', paddingTop: 32, paddingRight: 24, paddingBottom: 32, borderRight: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 14px' }}>States</p>
          <button onClick={() => { setActiveState(null); setQuery(''); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: !activeState && !query ? '#f5f5f5' : 'none', border: 'none', padding: '6px 10px', fontSize: 13, color: !activeState && !query ? '#111' : '#666', cursor: 'pointer', fontWeight: !activeState && !query ? 600 : 400, marginBottom: 2 }}>
            All States
          </button>
          {allStates.map(state => {
            const count = CITIES.filter(c => c.state === state).length;
            const isActive = activeState === state;
            return (
              <button key={state} onClick={() => scrollToState(state)}
                style={{ display: 'flex', width: '100%', textAlign: 'left', background: isActive ? '#f5f5f5' : 'none', border: 'none', padding: '6px 10px', fontSize: 13, color: isActive ? '#111' : '#666', cursor: 'pointer', fontWeight: isActive ? 600 : 400, marginBottom: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{state}</span>
                <span style={{ fontSize: 11, color: '#bbb' }}>{count}</span>
              </button>
            );
          })}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 10px' }}>Generate</p>
            <Link href="/#generate" style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: '#111', padding: '10px 14px', textDecoration: 'none', textAlign: 'center' }}>
              Run a Brief →
            </Link>
          </div>
        </aside>

        {/* Right: City content */}
        <main style={{ flex: 1, minWidth: 0, paddingLeft: 40, paddingTop: 32, paddingBottom: 80 }}>
          {grouped.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
              <p style={{ fontSize: 16 }}>No jurisdictions match your search.</p>
              <button onClick={() => { setQuery(''); setActiveState(null); setIbcFilter(''); }}
                style={{ marginTop: 16, fontSize: 13, color: '#111', background: 'none', border: '1px solid #ddd', padding: '8px 20px', cursor: 'pointer' }}>
                Clear filters
              </button>
            </div>
          ) : grouped.map(([state, cities]) => (
            <div key={state} ref={el => { sectionRefs.current[state] = el; }} style={{ marginBottom: 48 }}>
              {/* State header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#111', margin: 0 }}>{state}</h2>
                <span style={{ fontSize: 12, color: '#bbb' }}>{cities.length} {cities.length === 1 ? 'city' : 'cities'}</span>
              </div>

              {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: '#e8e8e8' }}>
                  {cities.map(city => (
                    <Link key={city.slug} href={`/codes/${city.slug}`} style={{ textDecoration: 'none', background: '#fff', padding: '20px 22px', display: 'block', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <p style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 3px' }}>{city.city}</p>
                          <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{city.stateCode} {city.population && `· ${city.population}`}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, background: IBC_VERSION_COLOR[city.ibc] || '#555', color: '#fff', padding: '3px 8px', letterSpacing: '0.04em' }}>
                          IBC {city.ibc}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 3px' }}>IECC</p>
                          <p style={{ fontSize: 13, color: '#444', margin: 0 }}>{city.iecc}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 3px' }}>Permit</p>
                          <p style={{ fontSize: 13, color: '#444', margin: 0 }}>{city.permitWeeks}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 3px' }}>Zoning</p>
                          <p style={{ fontSize: 13, margin: 0 }}>
                            <span style={{ color: ZONING_COLOR[city.zoning] || '#444', fontWeight: 500 }}>{city.zoning}</span>
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 3px' }}>ADA</p>
                          <p style={{ fontSize: 13, color: city.ada ? '#2d6b2d' : '#8a2d2d', margin: 0, fontWeight: 500 }}>{city.ada ? 'Compliant' : 'Verify'}</p>
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#bbb' }}>View full profile</span>
                        <span style={{ fontSize: 11, color: '#111', fontWeight: 600 }}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* List view */
                <div style={{ border: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 120px 120px 60px', gap: 0, padding: '8px 16px', background: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
                    {['Jurisdiction', 'IBC', 'IECC', 'Zoning', 'Permit', 'ADA'].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999' }}>{h}</span>
                    ))}
                  </div>
                  {cities.map((city, i) => (
                    <Link key={city.slug} href={`/codes/${city.slug}`} style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '2fr 80px 80px 120px 120px 60px', gap: 0, padding: '12px 16px', borderBottom: i < cities.length - 1 ? '1px solid #f5f5f5' : 'none', background: '#fff', alignItems: 'center', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{city.city}</span>
                        <span style={{ fontSize: 12, color: '#bbb', marginLeft: 8 }}>{city.stateCode}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, background: IBC_VERSION_COLOR[city.ibc] || '#555', color: '#fff', padding: '2px 7px', display: 'inline-block', letterSpacing: '0.03em' }}>{city.ibc}</span>
                      <span style={{ fontSize: 13, color: '#555' }}>{city.iecc}</span>
                      <span style={{ fontSize: 13, color: ZONING_COLOR[city.zoning] || '#444', fontWeight: 500 }}>{city.zoning}</span>
                      <span style={{ fontSize: 13, color: '#555' }}>{city.permitWeeks}</span>
                      <span style={{ fontSize: 12, color: city.ada ? '#2d6b2d' : '#8a2d2d' }}>
                        {city.ada ? '✓' : '—'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Bottom CTA */}
          <div style={{ marginTop: 40, padding: '40px 48px', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', margin: '0 0 8px' }}>Ready to start?</p>
              <p style={{ fontSize: 22, fontFamily: 'var(--font-dm-serif, Georgia, serif)', color: '#fff', margin: '0 0 6px', fontWeight: 400 }}>Generate a full compliance brief.</p>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Enter your project parameters and get a complete report in 60 seconds.</p>
            </div>
            <Link href="/#generate" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#111', background: '#fff', padding: '14px 28px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Generate a Brief →
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e8e8e8', background: '#fff', padding: '32px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, border: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>CB</span>
            </div>
            <span style={{ fontSize: 12, color: '#999' }}>© 2025 CodeBrief</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Home', '/'], ['City Codes', '/codes'], ['Pricing', '/pricing'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
