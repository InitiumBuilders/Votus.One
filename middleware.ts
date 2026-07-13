import { NextResponse, type NextRequest } from "next/server";

// The oracle answers to every casing of its name:
// /Nat-Future-Insight, /NAT-FUTURE-INSIGHT, … → /nat-future-insight
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lower = pathname.toLowerCase();
  if (lower.startsWith("/nat-future-insight") && pathname !== lower) {
    const url = req.nextUrl.clone();
    url.pathname = lower;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// Matcher paths are case-sensitive, so match broadly on anything that looks
// like the oracle's name and let the function decide.
export const config = {
  matcher: ["/:name(nat-future-insight|Nat-Future-Insight|NAT-FUTURE-INSIGHT|Nat-future-insight|nat-Future-Insight)"],
};
