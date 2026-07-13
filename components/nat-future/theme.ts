// Design tokens for /nat-future-insight — the Oracle's language.
// Deep violet night, moonlit text, one gold reserved for prophecy.
export const night = "#070510";
export const veil = "rgba(124,77,255,0.85)"; // violet — the beyond
export const veilSoft = "rgba(124,77,255,0.35)";
export const gold = "#ffd166"; // prophecy gold
export const goldSoft = "rgba(255,209,102,0.7)";
export const moon = "rgba(238,233,255,0.92)"; // moonlit body text
export const mid = "rgba(238,233,255,0.65)";
export const dim = "rgba(238,233,255,0.42)";
export const faint = "rgba(238,233,255,0.25)";
export const teal = "#67e8f9"; // the current — real-world data

// The oracle speaks in serif; the interface stays modern sans.
export const serif = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";
export const sans =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const kickerStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.5em",
  textTransform: "uppercase",
  color: dim,
  fontFamily: sans,
};

// The channel this oracle listens through — the Davara Baseline token.
export const DAVARA_CHANNEL = "MCPD-D8CF-0WX6-YD6G-16X4-WV57-0RXV-2ESQ-KMH8";
export const DAVARA_CHANNEL_SHORT = "MCPD-D8CF-····-KMH8";
