// Shared design tokens for /prompthero — the site's cinematic language,
// plus one warm gold reserved for earned things (badges, EVOs).
export const dim = "rgba(250,250,250,0.45)";
export const mid = "rgba(250,250,250,0.65)";
export const faint = "rgba(250,250,250,0.3)";
export const cyan = "#00d4ff";
export const gold = "rgba(255,209,102,0.85)";
export const ember = "#ff9e64";
export const emberDeep = "#ff7a45";

export const kickerStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.5em",
  textTransform: "uppercase",
  color: dim,
  marginBottom: 20,
};

export const h2Style: React.CSSProperties = {
  fontSize: "clamp(1.7rem, 6vw, 2.6rem)",
  fontWeight: 200,
  letterSpacing: "0.1em",
  marginBottom: 20,
  textShadow: "0 0 30px rgba(0,212,255,0.12)",
};

export const bodyStyle: React.CSSProperties = {
  fontSize: "clamp(0.95rem, 2.4vw, 1.1rem)",
  fontWeight: 300,
  lineHeight: 2,
  color: mid,
};

export const sectionStyle: React.CSSProperties = {
  padding: "72px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

export const columnStyle: React.CSSProperties = {
  maxWidth: 640,
  width: "100%",
};
