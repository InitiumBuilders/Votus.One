"use client";

import { useEffect, useState } from "react";

export default function SubCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/subscribe")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  if (count === null || count === 0) return null;

  return (
    <p style={{
      fontSize: 11,
      letterSpacing: "0.15em",
      color: "rgba(0,212,255,0.4)",
      textAlign: "center",
      padding: "16px 0",
    }}>
      {count} {count === 1 ? "person" : "people"} have joined the movement
    </p>
  );
}
