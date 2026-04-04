/**
 * Avoid open redirects: only allow same-origin relative paths.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback: string,
): string {
  if (next == null || next === "") return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("\\") || next.includes("\n")) return fallback;
  return next;
}
