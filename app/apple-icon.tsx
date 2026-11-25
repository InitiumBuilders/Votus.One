import { ImageResponse } from "next/og";

// The flame in the V as a home-screen tile. iOS ignores SVG touch icons,
// so this one is a PNG; iOS rounds the corners itself, so the night runs
// edge to edge.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
        }}
      >
        <svg width="148" height="148" viewBox="0 0 512 512" fill="none">
          <path d="M86 170 L256 448 L426 170" stroke="#00d4ff" strokeOpacity="0.35" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M256 64 C288 139 347 176 347 261 A91 91 0 1 1 165 261 C165 186 224 144 256 64 Z" stroke="#ff9e64" strokeWidth="19" strokeLinejoin="round" fill="rgba(255,158,100,0.12)" />
          <path d="M256 208 C273 245 299 261 299 296 A43 43 0 1 1 213 296 C213 264 239 245 256 208 Z" fill="#ffd166" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
