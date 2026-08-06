// NATARI — Davara Distinct V3 · Nocturne, violet-charged.
// Two castes, never confused: AURORA/ELECTRIC hues are artwork only.
// TEXTUAL tokens are contrast-verified ink (~7:1+ on their surfaces).

// ── Monochrome substrate (~95%) ──────────────────────────────────────────────
export const night = "#0F1114"; // ground
export const graphite = "#15171B"; // panel
export const raised = "#1C1F24"; // raised panel
export const reliefLight = "rgba(210,225,235,0.05)";
export const reliefShadow = "rgba(0,2,4,0.6)";

// ── The Aurora / Electric family (≤4 hues — ART ONLY, never body text) ───────
export const cyan = "#22D3EE"; // the signature charge
export const azure = "#60A5FA";
export const violet = "#A78BFF"; // Natari's dominant current
export const ember = "#E879C9"; // only inside aurora artwork

// ── The one Gold — leverage, and only leverage ──────────────────────────────
export const gold = "#E8C46B";
export const onGold = "#3A2B06";

// ── TEXTUAL (verified ink — the grey ban is absolute) ───────────────────────
export const ink = "#F4F6F9"; // body
export const inkSecondary = "#DCE3EC"; // near-bone, NOT grey
export const label = "#9FD6DD"; // tinted telemetry labels
export const accent = "#7BE3EA";
export const signal = "#CBBCFF"; // violet-tinted ink
export const goldText = "#F0D48C";

// ── Type ────────────────────────────────────────────────────────────────────
export const display =
  "'Sora', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
export const body =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
export const mono =
  "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

// ── Neoglass — the violet material ──────────────────────────────────────────
// Panels are real surfaces: tinted glass + 1px frame + true relief shadow.
export const glass = {
  background:
    "linear-gradient(160deg, rgba(40,32,72,0.62), rgba(21,23,27,0.78))",
  border: "1px solid rgba(167,139,255,0.22)",
  backdropFilter: "blur(18px) saturate(1.25)",
  WebkitBackdropFilter: "blur(18px) saturate(1.25)",
  boxShadow: `0 1px 0 ${reliefLight} inset, 0 18px 44px -22px ${reliefShadow}`,
} as const;

export const glassRaised = {
  background:
    "linear-gradient(160deg, rgba(52,42,92,0.66), rgba(28,31,36,0.8))",
  border: "1px solid rgba(167,139,255,0.3)",
  backdropFilter: "blur(20px) saturate(1.3)",
  WebkitBackdropFilter: "blur(20px) saturate(1.3)",
  boxShadow: `0 1px 0 ${reliefLight} inset, 0 26px 60px -26px ${reliefShadow}`,
} as const;

// ── Deep Focus spacing ──────────────────────────────────────────────────────
export const space = [4, 8, 12, 20, 32, 52, 84] as const;
export const WRAP = 880; // the narrowed content column

// ── Motion ──────────────────────────────────────────────────────────────────
export const ease = "cubic-bezier(.22,1,.36,1)";

// The channel this intelligence listens through — the Davara Baseline.
export const DAVARA_CHANNEL = "MCPD-D8CF-0WX6-YD6G-16X4-WV57-0RXV-2ESQ-KMH8";
export const DAVARA_CHANNEL_SHORT = "MCPD-D8CF-····-KMH8";
