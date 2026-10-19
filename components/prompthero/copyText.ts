// One honest copy: the Clipboard API first, then the old textarea ritual —
// and a true answer either way, so no button ever claims a copy that failed.
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* denied or unfocused — fall through to the textarea */ }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  // Off-canvas and still: no scroll jump to the footer, no iOS zoom.
  ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:12pt;pointer-events:none;";
  const back = document.activeElement as HTMLElement | null;
  document.body.appendChild(ta);
  let ok = false;
  try {
    ta.focus({ preventScroll: true });
    ta.select();
    ta.setSelectionRange(0, text.length);
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  back?.focus?.({ preventScroll: true });
  return ok;
}

// Heard, not seen — the copy's outcome, for screen readers.
export const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
