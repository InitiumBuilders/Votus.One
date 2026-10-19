"use client";

import { useEffect, useRef } from "react";

// A modal that behaves like one: focus moves in when it opens, Tab stays
// inside, Escape closes it, and focus returns to whatever opened it.
// Attach the returned ref to the dialog's container (role="dialog" aria-modal).

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const opener = document.activeElement as HTMLElement | null;
    const items = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const first = items()[0];
    if (first) first.focus({ preventScroll: true });
    else {
      if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
      root.focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) { e.preventDefault(); return; }
      const head = list[0];
      const tail = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === head || !root.contains(active))) { e.preventDefault(); tail.focus(); }
      else if (!e.shiftKey && (active === tail || !root.contains(active))) { e.preventDefault(); head.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  return ref;
}
