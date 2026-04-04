// Report-specific input fields shown after report selection (Step 2.5)
// These appear in addition to the 4 universal fields (type, location, SF, stories)

export interface ReportField {
  key: string;
  label: string;
  type: "text" | "select" | "textarea" | "toggle";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const REPORT_FIELDS: Record<string, ReportField[]> = {
  "code-analysis": [
    { key: "occupancyType", label: "Occupancy Classification", type: "select", options: ["Auto-classify", "A-1 Assembly (theater)", "A-2 Assembly (restaurant, bar)", "A-3 Assembly (worship, recreation)", "B Business (office)", "E Educational", "F-1 Factory (moderate hazard)", "H Hazardous", "I-1 Institutional (assisted living)", "I-2 Institutional (hospital)", "M Mercantile (retail)", "R-1 Residential (hotel)", "R-2 Residential (apartment)", "R-3 Residential (1-2 family)", "S-1 Storage (moderate hazard)", "S-2 Storage (low hazard)"] },
    { key: "sprinklered", label: "Sprinklered?", type: "select", options: ["Unknown — analyze requirement", "Yes — NFPA 13", "Yes — NFPA 13R", "No"] },
    { key: "mixedUseBreakdown", label: "Mixed-Use Breakdown (if applicable)", type: "text", placeholder: "e.g., Ground floor retail 5,000 SF, floors 2-4 residential" },
    { key: "lotSize", label: "Lot Size", type: "text", placeholder: "e.g., 10,000 SF or 0.25 acres" },
    { key: "occupantLoad", label: "Estimated Occupant Load", type: "text", placeholder: "e.g., 200 (or leave blank to calculate)" },
    { key: "newOrRenovation", label: "Project Scope", type: "select", options: ["New construction", "Renovation / alteration", "Addition to existing", "Change of occupancy"] },
  ],

  "zoning-feasibility": [
    { key: "siteAddress", label: "Site Address (specific)", type: "text", placeholder: "Full street address for parcel lookup", required: true },
    { key: "zoningDistrict", label: "Known Zoning District (if any)", type: "text", placeholder: "e.g., C-MX-5, R-3, or leave blank" },
    { key: "lotSize", label: "Lot Size", type: "text", placeholder: "e.g., 10,000 SF or 0.25 acres", required: true },
    { key: "lotDimensions", label: "Lot Dimensions", type: "text", placeholder: "e.g., 100 ft × 100 ft or irregular" },
    { key: "proposedUse", label: "Proposed Use Description", type: "text", placeholder: "e.g., ground floor retail, 40 residential units above" },
    { key: "existingStructures", label: "Existing Structures on Site", type: "select", options: ["Vacant lot", "Existing building — to be demolished", "Existing building — to be renovated", "Existing building — addition planned", "Unknown"] },
    { key: "knownOverlays", label: "Known Overlay Districts", type: "text", placeholder: "e.g., historic district, transit overlay, or unknown" },
  ],

  "energy-compliance": [
    { key: "compliancePath", label: "Compliance Path Preference", type: "select", options: ["Not sure — recommend one", "Prescriptive", "Performance (whole-building)", "Energy Rating Index (ERI)"] },
    { key: "mechanicalSystem", label: "Anticipated Mechanical System", type: "select", options: ["Not decided", "Rooftop units (RTU)", "Variable refrigerant flow (VRF)", "Chiller/boiler", "Split systems", "Heat pump — air source", "Heat pump — ground source", "Radiant", "Other"] },
    { key: "wallAssembly", label: "Anticipated Wall Assembly", type: "select", options: ["Not decided", "Metal stud with continuous insulation", "CMU / masonry", "Wood frame", "Precast concrete", "Curtain wall", "Other"] },
    { key: "windowToWallRatio", label: "Estimated Window-to-Wall Ratio", type: "select", options: ["Not sure", "Less than 30%", "30-40%", "40-50%", "Over 50%"] },
    { key: "renewableGoals", label: "Renewable Energy Goals", type: "select", options: ["None / not required", "Solar-ready only", "Rooftop solar PV planned", "Net-zero energy target", "Other"] },
  ],

  "cost-context": [
    { key: "qualityLevel", label: "Construction Quality Level", type: "select", options: ["Economy / budget", "Standard / mid-range", "Premium / high-end", "Luxury / institutional"], required: true },
    { key: "newOrRenovation", label: "Project Scope", type: "select", options: ["New construction", "Renovation / gut rehab", "Adaptive reuse", "Addition to existing"], required: true },
    { key: "structuralSystem", label: "Anticipated Structural System", type: "select", options: ["Not decided", "Wood frame", "Steel frame", "Concrete", "Masonry bearing wall", "Hybrid"] },
    { key: "belowGrade", label: "Below-Grade Levels", type: "select", options: ["None", "1 level (parking or utility)", "2+ levels", "Full basement"] },
    { key: "laborMarket", label: "Labor Market", type: "select", options: ["Not sure", "Union / prevailing wage", "Open shop / non-union", "Mixed"] },
    { key: "siteConditions", label: "Site Conditions", type: "select", options: ["Flat / standard", "Sloped / challenging", "Brownfield / contaminated", "Waterfront", "Urban infill / tight access"] },
  ],

  "risk-due-diligence": [
    { key: "siteAddress", label: "Site Address (specific for mapping)", type: "text", placeholder: "Full street address for flood/seismic lookup", required: true },
    { key: "phaseOneESA", label: "Phase I Environmental Assessment", type: "select", options: ["Not done", "Done — clean", "Done — issues identified", "Unknown"] },
    { key: "geotechnical", label: "Geotechnical Investigation", type: "select", options: ["Not done", "Done — no issues", "Done — issues identified", "Unknown"] },
    { key: "historicStatus", label: "Historic Register Status", type: "select", options: ["Not listed / not in district", "In a historic district", "Individually listed", "Unknown — need to check"] },
    { key: "knownEasements", label: "Known Easements or Encumbrances", type: "text", placeholder: "e.g., utility easement on west side, or none known" },
    { key: "titleReport", label: "Title Report Available?", type: "select", options: ["Yes", "No", "In progress"] },
  ],

  "site-constraints": [
    { key: "lotSize", label: "Lot Size", type: "text", placeholder: "e.g., 10,000 SF or 0.25 acres", required: true },
    { key: "lotDimensions", label: "Lot Dimensions", type: "text", placeholder: "e.g., 100 ft wide × 120 ft deep" },
    { key: "lotFrontage", label: "Street Frontage", type: "text", placeholder: "e.g., 100 ft on Main St" },
    { key: "topography", label: "Topography", type: "select", options: ["Flat", "Gently sloped", "Steeply sloped", "Varies / complex", "Unknown"] },
    { key: "existingStructures", label: "Existing Structures", type: "select", options: ["Vacant lot", "Structure to be demolished", "Structure to remain", "Unknown"] },
    { key: "surveyAvailable", label: "Survey Available?", type: "select", options: ["Yes — ALTA/boundary survey", "Yes — topographic survey", "No survey yet", "Unknown"] },
    { key: "adjacentUses", label: "Adjacent Uses", type: "text", placeholder: "e.g., residential to north, commercial to south" },
  ],

  "sustainability-scoping": [
    { key: "certificationTarget", label: "Target Certification", type: "select", options: ["None — just meet code", "LEED Certified", "LEED Silver", "LEED Gold", "LEED Platinum", "WELL Certification", "Fitwel", "Living Building Challenge", "Multiple / exploring options"], required: true },
    { key: "ownerPriority", label: "Owner's Sustainability Priority", type: "select", options: ["Minimize cost premium", "Maximize energy performance", "Minimize carbon footprint", "Occupant health & wellness", "Marketability / tenant attraction", "Balanced approach"] },
    { key: "budgetForSustainability", label: "Budget for Sustainability Premium", type: "select", options: ["Minimal — code minimum only", "Moderate — 2-5% premium acceptable", "Significant — 5-10% premium acceptable", "Aggressive — performance over cost", "Unknown"] },
    { key: "netZero", label: "Net-Zero Energy Goal?", type: "select", options: ["No", "Net-zero ready", "Net-zero operational", "Exploring"] },
    { key: "embodiedCarbon", label: "Embodied Carbon Goals", type: "select", options: ["Not a priority", "Tracking only", "Reduction target", "Unknown"] },
  ],

  "permitting-pathway": [
    { key: "preAppMeeting", label: "Pre-Application Meeting Status", type: "select", options: ["Not scheduled", "Scheduled", "Completed", "Not required"], required: true },
    { key: "variancesNeeded", label: "Variances or Special Exceptions Needed?", type: "select", options: ["None anticipated", "Likely — height or density", "Likely — setback or parking", "Likely — use (conditional use permit)", "Unknown — need analysis"] },
    { key: "designReview", label: "Design Review Board Applicable?", type: "select", options: ["Yes", "No", "Unknown"] },
    { key: "environmentalReview", label: "Environmental Review Trigger", type: "select", options: ["None anticipated", "NEPA (federal)", "State equivalent (CEQA, SEPA, etc.)", "Unknown"] },
    { key: "timelineUrgency", label: "Timeline Urgency", type: "select", options: ["Standard — no rush", "Moderate — prefer expedited", "Urgent — hard deadline", "Fast-track — parallel permitting needed"] },
    { key: "priorApprovals", label: "Any Prior Approvals Obtained?", type: "text", placeholder: "e.g., zoning approved, site plan in review, or none" },
  ],

  "accessibility-review": [
    { key: "publicOrPrivate", label: "Facility Type", type: "select", options: ["Public accommodation (open to public)", "Private / restricted access", "Mixed — public and private areas"], required: true },
    { key: "newOrAlteration", label: "New Construction or Alteration?", type: "select", options: ["New construction", "Alteration — less than 20% of building value", "Alteration — 20% or more of building value", "Alteration — primary function area"], required: true },
    { key: "federalFunding", label: "Federal Funding Involved?", type: "select", options: ["No", "Yes — triggers Section 504", "Unknown"] },
    { key: "residentialUnits", label: "Residential Units (if applicable)", type: "text", placeholder: "e.g., 40 units (triggers Fair Housing Act if 4+)" },
    { key: "verticalCirculation", label: "Elevator Planned?", type: "select", options: ["Yes", "No — analyzing if required", "Not decided"] },
    { key: "stateAccessCode", label: "Known State Accessibility Code", type: "text", placeholder: "e.g., California CBC Ch 11B, or leave blank to research" },
  ],

  "consultant-scoping": [
    { key: "deliveryMethod", label: "Project Delivery Method", type: "select", options: ["Design-Bid-Build", "CM at Risk", "Design-Build", "Integrated Project Delivery (IPD)", "Not decided"], required: true },
    { key: "mepComplexity", label: "MEP Complexity", type: "select", options: ["Standard — typical office/residential", "Moderate — restaurant, medical office, lab", "High — hospital, data center, clean room", "Unknown"] },
    { key: "structuralSystem", label: "Structural System", type: "select", options: ["Wood frame", "Steel frame", "Concrete", "Masonry", "Hybrid / not decided"] },
    { key: "specialSystems", label: "Specialty Systems Anticipated", type: "text", placeholder: "e.g., commercial kitchen, AV, security, curtain wall, pool" },
    { key: "leedCertification", label: "LEED or Green Certification?", type: "select", options: ["No", "Yes — need commissioning agent", "Exploring"] },
    { key: "inHouseCapabilities", label: "In-House Capabilities", type: "text", placeholder: "e.g., we do interior design in-house, need all engineering external" },
  ],

  "project-schedule": [
    { key: "targetOccupancy", label: "Target Occupancy Date", type: "text", placeholder: "e.g., Fall 2027, or ASAP, or flexible" },
    { key: "deliveryMethod", label: "Project Delivery Method", type: "select", options: ["Design-Bid-Build (sequential)", "CM at Risk (overlapping)", "Design-Build (fast-track)", "Not decided"], required: true },
    { key: "entitlementStatus", label: "Entitlement/Zoning Status", type: "select", options: ["Not started", "Pre-application meeting done", "In progress", "Approved/complete"], required: true },
    { key: "fastTrack", label: "Fast-Track Strategy?", type: "select", options: ["No — standard sequential", "Yes — overlap design and permitting", "Yes — phased permits (foundation first)", "Exploring options"] },
    { key: "seasonalConstraints", label: "Seasonal Construction Constraints", type: "select", options: ["None significant", "Cold weather — limited winter work", "Rainy season impacts", "Hurricane season", "Unknown"] },
    { key: "longLeadItems", label: "Known Long-Lead Items", type: "text", placeholder: "e.g., structural steel, elevator, switchgear, or none identified" },
  ],
};

// Get the extra fields needed for a set of selected reports
// Deduplicates fields with the same key across reports
export function getFieldsForReports(reportIds: string[]): { reportId: string; reportName: string; fields: ReportField[] }[] {
  const seenKeys = new Set<string>();
  const result: { reportId: string; reportName: string; fields: ReportField[] }[] = [];

  for (const id of reportIds) {
    const fields = REPORT_FIELDS[id];
    if (!fields) continue;

    const uniqueFields = fields.filter((f) => {
      if (seenKeys.has(f.key)) return false;
      seenKeys.add(f.key);
      return true;
    });

    if (uniqueFields.length > 0) {
      // Get report name from key
      const nameMap: Record<string, string> = {
        "code-analysis": "Code Analysis",
        "zoning-feasibility": "Zoning Feasibility",
        "energy-compliance": "Energy Compliance",
        "cost-context": "Cost Context",
        "risk-due-diligence": "Risk & Due Diligence",
        "site-constraints": "Site Constraints",
        "sustainability-scoping": "Sustainability",
        "permitting-pathway": "Permitting Pathway",
        "accessibility-review": "Accessibility",
        "consultant-scoping": "Consultant Scoping",
        "project-schedule": "Project Schedule",
      };
      result.push({ reportId: id, reportName: nameMap[id] || id, fields: uniqueFields });
    }
  }

  return result;
}
