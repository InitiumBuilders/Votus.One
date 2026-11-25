import { NextResponse, type NextRequest } from "next/server";

// The oracle — and Natari — answer to every casing of their names:
// /Nat-Future-Insight, /NAT-FUTURE-INSIGHT, /NATARI, … → the lowercase route
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lower = pathname.toLowerCase();
  if ((lower.startsWith("/nat-future-insight") || lower === "/natari") && pathname !== lower) {
    const url = req.nextUrl.clone();
    url.pathname = lower;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// Matcher paths are case-sensitive, so each letter carries both cases —
// every spelling of the names reaches the function, nothing else does.
export const config = {
  matcher: [
    "/:name([nN][aA][tT]-[fF][uU][tT][uU][rR][eE]-[iI][nN][sS][iI][gG][hH][tT])",
    "/:name([nN][aA][tT][aA][rR][iI])",
  ],
};
