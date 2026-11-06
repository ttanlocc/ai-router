import { describe, it, expect } from "vitest";
import { normalizeModelName, isModelAllowed, sanitizeAllowlist } from "../../src/sse/services/keyModelAllowlist.js";

describe("normalizeModelName", () => {
  it("strips the leading provider segment", () => {
    expect(normalizeModelName("anthropic/claude-haiku-5-5")).toBe("claude-haiku-5-5");
    expect(normalizeModelName("claude-haiku-5-5")).toBe("claude-haiku-5-5");
  });
  it("keeps combo names (no slash) as-is and trims", () => {
    expect(normalizeModelName("  haiku ")).toBe("haiku");
  });
  it("returns empty string for non-strings", () => {
    expect(normalizeModelName(undefined)).toBe("");
    expect(normalizeModelName(42)).toBe("");
  });
});

describe("isModelAllowed", () => {
  it("allows everything when the allowlist is empty or missing", () => {
    expect(isModelAllowed([], "claude-opus-5-5")).toBe(true);
    expect(isModelAllowed(undefined, "claude-opus-5-5")).toBe(true);
  });
  it("matches by model name regardless of provider prefix", () => {
    const list = ["claude-haiku-5-5"];
    expect(isModelAllowed(list, "claude-haiku-5-5")).toBe(true);
    expect(isModelAllowed(list, "anthropic/claude-haiku-5-5")).toBe(true);
    expect(isModelAllowed(list, "cc/claude-haiku-5-5")).toBe(true);
  });
  it("blocks models not in the list", () => {
    expect(isModelAllowed(["claude-haiku-5-5"], "claude-opus-5-5")).toBe(false);
    expect(isModelAllowed(["claude-haiku-5-5"], "anthropic/claude-opus-5-5")).toBe(false);
  });
  it("allows a combo name that is in the list", () => {
    expect(isModelAllowed(["haiku"], "haiku")).toBe(true);
    expect(isModelAllowed(["haiku"], "opus")).toBe(false);
  });
});

describe("sanitizeAllowlist", () => {
  it("normalizes, trims and dedupes", () => {
    expect(sanitizeAllowlist(["anthropic/claude-haiku-5-5", "claude-haiku-5-5", " haiku "])).toEqual({
      models: ["claude-haiku-5-5", "haiku"],
    });
  });
  it("accepts an empty array (unrestricted)", () => {
    expect(sanitizeAllowlist([])).toEqual({ models: [] });
  });
  it("rejects non-array and non-string entries", () => {
    expect(sanitizeAllowlist("claude").error).toBeTruthy();
    expect(sanitizeAllowlist([1]).error).toBeTruthy();
  });
  it("rejects empty and overlong names", () => {
    expect(sanitizeAllowlist(["anthropic/"]).error).toBeTruthy();
    expect(sanitizeAllowlist(["x".repeat(201)]).error).toBeTruthy();
  });
});
