// Per-key model allowlist. Matching is by model name only (global, not per provider):
// "anthropic/claude-haiku-5-5" and "claude-haiku-5-5" are the same model. Combo names
// contain no "/" and are matched as-is; a combo grants its member models implicitly.

export function normalizeModelName(name) {
  if (typeof name !== "string") return "";
  const trimmed = name.trim();
  const slash = trimmed.indexOf("/");
  return slash === -1 ? trimmed : trimmed.slice(slash + 1);
}

// Empty or missing allowlist = unrestricted (existing keys keep working unchanged).
export function isModelAllowed(allowlist, requested) {
  if (!Array.isArray(allowlist) || allowlist.length === 0) return true;
  const wanted = normalizeModelName(requested);
  return allowlist.some((m) => normalizeModelName(m) === wanted);
}

// Validates and normalizes a list coming from the dashboard/API. Returns { models } or { error }.
export function sanitizeAllowlist(input) {
  if (!Array.isArray(input) || input.some((m) => typeof m !== "string")) {
    return { error: "models must be an array of strings" };
  }
  const out = [];
  for (const raw of input) {
    const name = normalizeModelName(raw);
    if (!name) return { error: `Invalid model name: ${raw}` };
    if (name.length > 200) return { error: `Model name too long: ${name.slice(0, 40)}…` };
    if (!out.includes(name)) out.push(name);
  }
  return { models: out };
}
