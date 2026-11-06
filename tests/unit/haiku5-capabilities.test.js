import { describe, it, expect } from "vitest";
import { getCapabilitiesForModel } from "../../open-sse/providers/capabilities.js";

describe("haiku thinking format", () => {
  it("haiku 5.x uses adaptive thinking", () => {
    expect(getCapabilitiesForModel("anthropic", "claude-haiku-5-5").thinkingFormat).toBe("claude-adaptive");
  });
  it("pre-5 haiku keeps budget thinking", () => {
    expect(getCapabilitiesForModel("anthropic", "claude-haiku-4-5-20251001").thinkingFormat).toBe("claude-budget");
  });
});
