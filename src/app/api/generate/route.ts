import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput, validateInput } from "@/lib/sanitize";

const anthropic = new Anthropic();

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://codecompliance-delta.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
].filter(Boolean);

interface ProjectInput {
  buildingType: string;
  location: string;
  squareFootage: string;
  stories: string;
  occupancyType: string;
  occupantLoad: string;
  lotSize: string;
  additionalNotes: string;
}

const SYSTEM_PROMPT = `You are an expert building code analyst and licensed architect producing a professional Code Analysis Report in the industry-standard tabular format used by US architecture firms.

You will be given project details and web search results about applicable codes for the project's jurisdiction.

CRITICAL INSTRUCTIONS:
1. Every requirement MUST cite a specific code section (e.g., "IBC 2021 §903.2.1.1", "Portland Title 33 §33.130.210"). Do NOT fabricate section numbers — if you cannot find the exact section, cite the general source (e.g., "per Portland Zoning Code") and mark ⚠ VERIFY WITH AHJ.
2. Include CALCULATIONS where applicable — occupant loads, allowable areas, exit widths, parking counts, FAR calculations. Show the math.
3. Use the TABULAR FORMAT below — requirement | code reference | project compliance/notes. This is how architects present code analysis in drawing sets.
4. Proactively surface requirements the architect may not have considered in the Risk Flags section.

OUTPUT FORMAT — Use markdown tables and headers exactly as structured below:

## Code Analysis Report

**Project:** [Building type] | **Location:** [City, State] | **Date:** [Today's date]
**Size:** [SF] | **Stories:** [#] | **Occupancy:** [Group] | **Construction Type:** [Type]

### Applicable Codes & Editions

| Code | Edition/Version | Local Amendments |
|------|----------------|-----------------|
| (List IBC version, local building code, fire code, energy code, zoning code, accessibility standard adopted by this jurisdiction) |

### Zoning Summary

| Requirement | Code Reference | Project Compliance |
|-------------|---------------|-------------------|
| Zoning District | § reference | District designation and permitted uses |
| Height Limit | § reference | Allowable vs. proposed |
| FAR | § reference | Allowable FAR × lot size = allowable area vs. proposed |
| Front Setback | § reference | Required vs. proposed |
| Side Setback | § reference | Required vs. proposed |
| Rear Setback | § reference | Required vs. proposed |
| Parking | § reference | Required spaces calculated by use type |
| Bicycle Parking | § reference | Required count |
| Overlay Districts | § reference | Any applicable overlays |

### Building Code Analysis

| Requirement | Code Reference | Project Compliance |
|-------------|---------------|-------------------|
| Occupancy Classification | IBC Ch. 3 | Group(s) with reasoning |
| Construction Type | IBC Ch. 6 | Type with justification based on height/area/occupancy |
| Allowable Height | IBC Table 504.3 | Stories and feet — show calculation with sprinkler increases |
| Allowable Area | IBC Table 506.2 | Base area × frontage increase × sprinkler increase = allowable vs. proposed |
| Fire-Resistance Ratings | IBC Table 601 | Structural frame, bearing walls, floor, roof ratings |
| Occupancy Separation | IBC Table 508.4 | Required separation ratings between occupancy groups |
| Sprinkler Required | IBC §903.2 | Yes/No with triggering condition |

### Means of Egress

| Requirement | Code Reference | Calculation / Compliance |
|-------------|---------------|------------------------|
| Occupant Load | IBC Table 1004.5 | Area ÷ load factor = occupant load PER FLOOR. Show the math. |
| Number of Exits | IBC Table 1006.3.1 | Required based on occupant load |
| Exit Width | IBC §1005.1 | Occupant load × 0.2"/person (stairs) or 0.15"/person (other) |
| Travel Distance | IBC Table 1017.2 | Maximum allowed vs. estimated |
| Common Path | IBC §1006.2.1 | Maximum allowed |
| Exit Signs/Emergency Lighting | IBC §1013, §1008 | Required Yes/No |

### Fire Protection

| Requirement | Code Reference | Project Compliance |
|-------------|---------------|-------------------|
| Sprinkler System | IBC/NFPA 13 | System type required |
| Fire Alarm | IBC §907 | Type required with triggering condition |
| Standpipes | IBC §905 | Required Yes/No with reason |
| Fire Separation Distance | IBC Table 602 | Distance to property lines and rated wall requirements |
| Smoke/Fire Barriers | IBC §706-711 | Required locations |

### Accessibility (ADA / State Equivalent)

| Requirement | Code Reference | Project Compliance |
|-------------|---------------|-------------------|
| Accessible Route | ADA/ICC A117.1 | Required path of travel |
| Accessible Entrances | ADA §206.4 | Number required |
| Accessible Parking | ADA §208 | Total spaces required per count, van spaces |
| Accessible Restrooms | ADA §213 | Requirements per fixture count |
| Elevator | ADA §206.6 | Required Yes/No with triggering condition |
| State/Local Additions | (cite state) | Any requirements exceeding federal ADA |

### Plumbing Fixtures (IPC)

| Fixture | Code Reference | Required Count (show math) |
|---------|---------------|--------------------------|
| Water Closets (Male) | IPC Table 403.1 | Occupant load ÷ ratio by occupancy type |
| Water Closets (Female) | IPC Table 403.1 | Occupant load ÷ ratio by occupancy type |
| Lavatories | IPC Table 403.1 | Count per occupancy |
| Drinking Fountains | IPC Table 403.1 | 1 per 100 occupants minimum, hi-lo pair |
| Service Sink | IPC Table 403.1 | 1 per building minimum |
| Urinals (if applicable) | IPC Table 403.1 | May substitute up to 67% of male water closets |

### Energy Code

| Requirement | Code Reference | Project Compliance |
|-------------|---------------|-------------------|
| Applicable Code | (IECC year adopted) | Version and climate zone |
| Climate Zone | IECC Figure C301.1 | Zone designation |
| Envelope (walls) | IECC Table C402.1.3 | R-value or U-factor required |
| Envelope (roof) | IECC Table C402.1.3 | R-value required |
| Glazing | IECC Table C402.4 | Maximum U-factor and SHGC |
| Lighting Power | IECC §C405 | Maximum W/SF by space type |
| Mechanical Efficiency | IECC §C403 | Minimum efficiency standards |

### Risk Flags & Additional Requirements

Use a numbered list. Each flag must include:
- What the risk is
- Why it matters for this specific project
- What to verify and with whom

Flag items like: flood zones, seismic design category, wind speed/hurricane requirements, historic districts, environmental restrictions, stormwater/impervious cover, impact fees, special permits, proximity compatibility requirements, and any jurisdiction-specific requirements that commonly surprise architects.

### Sources

List all code documents, municipal websites, and references used. Include URLs where available.

REMEMBER:
- Lead with LOCAL requirements, then note IBC baseline where different
- Show calculations — architects need to see the math to trust the numbers
- Mark uncertain items with ⚠ VERIFY WITH AHJ
- This document should look like it belongs in a professional drawing set`;

function buildSearchQueries(input: ProjectInput): string[] {
  const { location, buildingType } = input;
  return [
    `${location} zoning code height limits setback requirements FAR`,
    `${location} building code IBC version fire code energy code IECC`,
    `${buildingType} ${location} building permit parking requirements`,
    `${location} flood zone seismic category ADA accessibility requirements`,
    `${location} construction type fire separation sprinkler requirements`,
  ];
}

function buildUserPrompt(input: ProjectInput, searchResults: string): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const parts = [
    `TODAY'S DATE: ${today}`,
    ``,
    `PROJECT DETAILS:`,
    `- Building Type: ${input.buildingType}`,
    `- Location: ${input.location}`,
    `- Total Square Footage: ${input.squareFootage}`,
    `- Number of Stories: ${input.stories}`,
  ];
  if (input.occupancyType) parts.push(`- Occupancy Type: ${input.occupancyType}`);
  if (input.occupantLoad) parts.push(`- Estimated Occupant Load: ${input.occupantLoad}`);
  if (input.lotSize) parts.push(`- Lot Size: ${input.lotSize}`);
  if (input.additionalNotes) parts.push(`- Additional Notes: ${input.additionalNotes}`);

  parts.push("");
  parts.push("WEB SEARCH RESULTS (use these to identify jurisdiction-specific requirements):");
  parts.push(searchResults);
  parts.push("");
  parts.push(
    "Generate a comprehensive Code Compliance Brief for this project. Be specific to the jurisdiction. Cite code sections where possible. Flag uncertainties. Proactively surface risk flags the architect may not have considered."
  );
  return parts.join("\n");
}

export async function POST(req: Request) {
  try {
    // CORS check
    const origin = req.headers.get("origin") || "";
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const { allowed, remaining } = rateLimit(ip);
    if (!allowed) {
      return Response.json(
        { error: "Rate limit exceeded. Please wait a minute before generating another brief." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Sanitize and validate input
    const rawInput = await req.json();
    const sanitized = sanitizeInput(rawInput);
    const validationError = validateInput(sanitized);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }
    const input: ProjectInput = {
      buildingType: sanitized.buildingType,
      location: sanitized.location,
      squareFootage: sanitized.squareFootage,
      stories: sanitized.stories,
      occupancyType: sanitized.occupancyType,
      occupantLoad: sanitized.occupantLoad,
      lotSize: sanitized.lotSize,
      additionalNotes: sanitized.additionalNotes,
    };

    // Phase 1: Web search — gather code data from public sources
    const queries = buildSearchQueries(input);
    const searchResults = await performSearches(queries);

    // Phase 2: LLM synthesis — generate the structured brief
    const userPrompt = buildUserPrompt(input, searchResults);

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "X-RateLimit-Remaining": String(remaining),
        ...(origin && ALLOWED_ORIGINS.includes(origin)
          ? { "Access-Control-Allow-Origin": origin }
          : {}),
      },
    });
  } catch (err) {
    console.error("Generate brief error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

async function performSearches(queries: string[]): Promise<string> {
  const results: string[] = [];

  // Run searches sequentially to avoid rate limits
  for (const query of queries) {
    try {
      const result = await webSearch(query);
      results.push(`\n--- Search: "${query}" ---\n${result || "No results found."}`);
    } catch {
      results.push(`\n--- Search: "${query}" ---\nNo results found.`);
    }
  }

  return results.join("\n");
}

async function webSearch(query: string): Promise<string> {
  // Use Anthropic API directly with web_search tool
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        },
      ],
      messages: [
        {
          role: "user",
          content: `Search for: ${query}\n\nReturn the most relevant factual information you find about building codes, zoning requirements, and regulations. Focus on specific code requirements, ordinance numbers, and regulatory details. Be concise but include specific numbers, section references, and requirements.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Web search API error for "${query}":`, errText);
    return "";
  }

  const data = await response.json();

  // Extract text blocks from the response
  const textBlocks = data.content?.filter(
    (block: { type: string }) => block.type === "text"
  );
  return (
    textBlocks
      ?.map((block: { text: string }) => block.text)
      .join("\n") || ""
  );
}
