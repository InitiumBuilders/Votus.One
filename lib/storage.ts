// Legacy storage — all APIs now use @vercel/kv (see lib/kv.ts)
// This file kept for backward compatibility with any imports.
// TODO: Remove once all references are cleaned up.

export function loadJSON<T>(_filename: string, fallback: T): T {
  return fallback;
}

export function saveJSON<T>(_filename: string, _data: T): void {
  // no-op
}

export function appendLog(_filename: string, _line: string): void {
  // no-op
}
