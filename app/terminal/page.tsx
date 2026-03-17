import type { Metadata } from "next";
import TerminalUI from "./TerminalUI";

export const metadata: Metadata = {
  title: "VOTUS TERMINAL",
  description: "Access granted.",
  robots: { index: false },
};

export default function TerminalPage() {
  return <TerminalUI />;
}
