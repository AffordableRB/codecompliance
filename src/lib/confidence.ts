/**
 * CodeBrief Confidence Tier System
 *
 * Three tiers:
 *   [CONFIRMED]  — directly sourced from a specific code section or official URL
 *   [VERIFY]     — derived, calculated, or inferred — correct methodology but confirm with AHJ
 *   [GAP]        — data not found, jurisdiction-specific data unavailable, or conflicting sources
 */

export type ConfidenceTier = "CONFIRMED" | "VERIFY" | "GAP";

export interface ConfidenceTag {
  tier: ConfidenceTier;
  source?: string;   // e.g. "IBC 2021 §903.2.1.1"
  note?: string;     // e.g. "Calculated from occupant load; verify with AHJ"
  position: number;  // character offset in the raw markdown
}

export interface ParsedSource {
  label: string;
  url?: string;
  section?: string;
  tier: ConfidenceTier;
}

/** Regex patterns for inline confidence tags emitted by the LLM */
const CONFIRMED_RE = /\[CONFIRMED(?::([^\]]*))?\]/g;
const VERIFY_RE    = /\[VERIFY(?::([^\]]*))?\]/g;
const GAP_RE       = /\[GAP(?::([^\]]*))?\]/g;

/**
 * Strip all confidence tags from raw markdown and return clean text
 * plus a list of tag positions for the UI to render as inline badges.
 */
export function parseConfidenceTags(raw: string): {
  clean: string;
  tags: ConfidenceTag[];
} {
  const tags: ConfidenceTag[] = [];
  let clean = raw;

  // Process in reverse order so positions stay valid as we replace
  const allMatches: Array<{ match: RegExpExecArray; tier: ConfidenceTier }> = [];

  let m: RegExpExecArray | null;

  const cr = new RegExp(CONFIRMED_RE.source, "g");
  while ((m = cr.exec(raw)) !== null)
    allMatches.push({ match: m, tier: "CONFIRMED" });

  const vr = new RegExp(VERIFY_RE.source, "g");
  while ((m = vr.exec(raw)) !== null)
    allMatches.push({ match: m, tier: "VERIFY" });

  const gr = new RegExp(GAP_RE.source, "g");
  while ((m = gr.exec(raw)) !== null)
    allMatches.push({ match: m, tier: "GAP" });

  // Sort by position descending so we can replace without shifting offsets
  allMatches.sort((a, b) => b.match.index - a.match.index);

  for (const { match, tier } of allMatches) {
    const note = match[1]?.trim() || undefined;
    tags.push({ tier, note, position: match.index });
    clean = clean.slice(0, match.index) + clean.slice(match.index + match[0].length);
  }

  // Re-sort tags by ascending position for rendering
  tags.sort((a, b) => a.position - b.position);

  return { clean, tags };
}

/**
 * Extract a Sources list from the ## Sources section of a report.
 * Returns structured ParsedSource objects.
 */
export function extractSources(markdown: string): ParsedSource[] {
  const sources: ParsedSource[] = [];

  // Find the ## Sources section
  const sourcesMatch = markdown.match(/##\s+Sources\s*\n([\s\S]*?)(?=\n##\s|\n---\s*$|$)/i);
  if (!sourcesMatch) return sources;

  const block = sourcesMatch[1];
  const lines = block.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const stripped = line.replace(/^[-*\d.]+\s*/, "").trim();
    if (!stripped) continue;

    // Try to extract URL
    const urlMatch = stripped.match(/https?:\/\/[^\s)]+/);
    const url = urlMatch?.[0];

    // Try to extract section reference
    const sectionMatch = stripped.match(/§\s*[\w.]+|IBC\s+[\d.]+|ADA\s+§[\d.]+|IECC\s+[\w.]+|IPC\s+[\w.]+/i);
    const section = sectionMatch?.[0];

    // Determine tier from presence of ⚠ or [VERIFY] / [GAP] markers
    let tier: ConfidenceTier = "CONFIRMED";
    if (/\[VERIFY\]|⚠/i.test(stripped)) tier = "VERIFY";
    if (/\[GAP\]/i.test(stripped)) tier = "GAP";

    // Clean label
    const label = stripped
      .replace(/\[CONFIRMED\]|\[VERIFY\]|\[GAP\]/gi, "")
      .replace(/https?:\/\/[^\s)]+/g, "")
      .replace(/[()[\]]/g, "")
      .trim();

    if (label) sources.push({ label, url, section, tier });
  }

  return sources;
}

/** Confidence tier display metadata */
export const TIER_META: Record<ConfidenceTier, {
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}> = {
  CONFIRMED: {
    label: "Confirmed",
    color: "#166534",
    bg: "#dcfce7",
    border: "#86efac",
    description: "Directly sourced from a specific code section or official publication.",
  },
  VERIFY: {
    label: "Verify",
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fcd34d",
    description: "Derived or calculated — methodology is correct but confirm the specific requirement with your AHJ before relying on it.",
  },
  GAP: {
    label: "Data Gap",
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#fca5a5",
    description: "Jurisdiction-specific data was not found or sources conflicted. Manual research required.",
  },
};
