import kv, { keys } from "./kv";

export interface VotusUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  created: string;
  unitIds: string[];
}

export interface VotusSession {
  userId: string;
  email: string;
  name: string;
  expires: number;
}

// Simple hash — no bcrypt dep, just sha256-like using Web Crypto
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "votus-salt-2026");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(user: VotusUser): Promise<string> {
  const token = generateToken();
  const session: VotusSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  // Store session with 30-day TTL
  await kv.set(keys.session(token), JSON.stringify(session), { ex: 30 * 24 * 60 * 60 });
  return token;
}

export async function getSession(token: string | null | undefined): Promise<VotusSession | null> {
  if (!token) return null;
  try {
    const raw = await kv.get<string>(keys.session(token));
    if (!raw) return null;
    const session: VotusSession = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (session.expires < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: Request): Promise<VotusSession | null> {
  // Check Authorization header or cookie
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return getSession(auth.slice(7));
  }
  const cookie = req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/votus_session=([^;]+)/);
    if (match) return getSession(match[1]);
  }
  return null;
}
