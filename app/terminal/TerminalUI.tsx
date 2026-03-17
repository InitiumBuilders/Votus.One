"use client";

import { useEffect, useRef, KeyboardEvent } from "react";
import { useTerminal, Line } from "./useTerminal";
import MatrixRain from "@/components/MatrixRain";
import { playKeystroke, playCyberBlip, playTerminalBoot } from "@/components/SoundEngine";

function TerminalLine({ line }: { line: Line }) {
  return (
    <div style={{
      fontFamily: "monospace", fontSize: 13, lineHeight: "1.8",
      color: line.type === "input" ? "rgba(0,255,136,0.5)" :
        line.type === "system" ? "#00d4ff" : "rgba(0,255,136,0.85)",
      whiteSpace: "pre-wrap", wordBreak: "break-all",
    }}>
      {line.text}
    </div>
  );
}

export default function TerminalUI() {
  const { lines, input, setInput, runCommand, showMatrix, setShowMatrix, getCtx, navigateHistory } = useTerminal();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const ctx = getCtx();
    playTerminalBoot(ctx);
  }, [getCtx]);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const ctx = getCtx();
    playKeystroke(ctx);
    if (e.key === "Enter") {
      playCyberBlip(ctx);
      runCommand(input);
      setInput("");
    }
    if (e.key === "ArrowUp") { e.preventDefault(); navigateHistory("up"); }
    if (e.key === "ArrowDown") { e.preventDefault(); navigateHistory("down"); }
  };

  return (
    <>
      {showMatrix && <MatrixRain onDone={() => setShowMatrix(false)} />}
      <div
        style={{ background: "#000", minHeight: "100vh", padding: "24px 20px", cursor: "text" }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Boot header */}
        <div style={{ fontFamily: "monospace", color: "#00ff88", marginBottom: 20, lineHeight: 1.8 }}>
          <div style={{ fontSize: 16, letterSpacing: "0.1em" }}>VOTUS TERMINAL v1.0</div>
          <div style={{ fontSize: 11, color: "rgba(0,255,136,0.4)" }}>
            ████████████████████ 100% — SYSTEM READY
          </div>
          <div style={{ fontSize: 11, color: "rgba(0,255,136,0.4)", marginTop: 4 }}>
            Type 'help' for available commands.
          </div>
          <div style={{ height: 1, background: "rgba(0,255,136,0.15)", margin: "12px 0" }} />
        </div>

        {/* Output lines */}
        {lines.map((line, i) => <TerminalLine key={i} line={line} />)}

        {/* Input row */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
          <span style={{ fontFamily: "monospace", color: "#00ff88", fontSize: 13, marginRight: 8 }}>$</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            spellCheck={false}
            autoComplete="off"
            style={{
              background: "transparent", border: "none", outline: "none",
              fontFamily: "monospace", fontSize: 13, color: "#00ff88",
              flex: 1, caretColor: "#00ff88",
            }}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </>
  );
}
