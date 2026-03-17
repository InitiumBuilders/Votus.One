"use client";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  left: { d: number; h: number; m: number; s: number };
  flash: "extend" | "shorten" | null;
};

export function CountdownDigits({ left, flash }: Props) {
  const glowColor = flash === "extend"
    ? "rgba(0,212,255,0.6)"
    : flash === "shorten"
    ? "rgba(255,100,100,0.5)"
    : "transparent";

  return (
    <>
      <style>{`
        @keyframes cd-pop {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.2) translateY(-4px); }
          50% { transform: scale(0.95) translateY(1px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes cd-ripple {
          0% { transform: scale(0.3); opacity: 0.7; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes cd-glow-pulse {
          0% { box-shadow: 0 0 0px ${glowColor}; }
          50% { box-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor}; }
          100% { box-shadow: 0 0 0px ${glowColor}; }
        }
        @keyframes cd-tick {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .cd-digit-wrap {
          text-align: center;
          min-width: 46px;
          position: relative;
        }
        .cd-digit {
          font-size: 30;
          font-weight: 200;
          color: #00d4ff;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          margin-bottom: 4px;
          transition: color 0.3s;
        }
        .cd-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(250,250,250,0.25);
          line-height: 1;
        }
        .cd-sep {
          font-size: 24px;
          font-weight: 100;
          color: rgba(0,212,255,0.15);
          padding-top: 2px;
          animation: cd-tick 1s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        display: "inline-flex",
        gap: 8,
        justifyContent: "center",
        alignItems: "flex-start",
        position: "relative",
      }}>
        {/* Central ripple on vote */}
        {flash && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 60, height: 60, marginLeft: -30, marginTop: -30,
            borderRadius: "50%",
            border: `2px solid ${flash === "extend" ? "rgba(0,212,255,0.5)" : "rgba(255,100,100,0.5)"}`,
            animation: "cd-ripple 1s ease-out forwards",
            pointerEvents: "none",
          }} />
        )}

        {([
          [left.d, "Days", true],
          [null, ":", false],
          [left.h, "Hrs", false],
          [null, ":", false],
          [left.m, "Min", false],
          [null, ":", false],
          [left.s, "Sec", false],
        ] as const).map((item, i) => {
          if (item[0] === null) {
            return <span key={i} className="cd-sep">:</span>;
          }
          const [val, label, isDays] = item;
          return (
            <div key={label} className="cd-digit-wrap" style={{
              animation: flash && isDays ? "cd-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), cd-glow-pulse 1s ease" : undefined,
              borderRadius: 12,
            }}>
              <p className="cd-digit" style={{
                color: flash && isDays
                  ? flash === "extend" ? "#00ffcc" : "#ff6b6b"
                  : "#00d4ff",
                fontSize: 30,
              }}>
                {pad(val as number)}
              </p>
              <p className="cd-label">{label}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}
