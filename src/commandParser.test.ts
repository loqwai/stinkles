import { describe, it, expect } from "bun:test";
import { parseCommand } from "./commandParser";
import type { State } from "./world";

describe("commandParser", () => {
  const baseState: State = {
    reply: "",
    messages: [],
    seed: 1,
    inventory: [],
    verbosity: "normal",
  };

  describe("when input is not a command", () => {
    it("should return isCommand: false for regular text", () => {
      const result = parseCommand(baseState, "I open the door");
      expect(result.isCommand).toBe(false);
    });

    it("should return isCommand: false for text with / in the middle", () => {
      const result = parseCommand(baseState, "I go north/south");
      expect(result.isCommand).toBe(false);
    });
  });

  describe("/verbosity command", () => {
    it("should show current verbosity when no argument provided", () => {
      const result = parseCommand(baseState, "/verbosity");
      expect(result.isCommand).toBe(true);
      expect(result.message).toContain("Current verbosity: normal");
    });

    it("should set verbosity to terse", () => {
      const result = parseCommand(baseState, "/verbosity terse");
      expect(result.isCommand).toBe(true);
      expect(result.state?.verbosity).toBe("terse");
      expect(result.message).toContain("Verbosity set to terse");
    });

    it("should set verbosity to normal", () => {
      const result = parseCommand(baseState, "/verbosity normal");
      expect(result.isCommand).toBe(true);
      expect(result.state?.verbosity).toBe("normal");
      expect(result.message).toContain("Verbosity set to normal");
    });

    it("should set verbosity to verbose", () => {
      const result = parseCommand(baseState, "/verbosity verbose");
      expect(result.isCommand).toBe(true);
      expect(result.state?.verbosity).toBe("verbose");
      expect(result.message).toContain("Verbosity set to verbose");
    });

    it("should be case insensitive", () => {
      const result = parseCommand(baseState, "/verbosity VERBOSE");
      expect(result.isCommand).toBe(true);
      expect(result.state?.verbosity).toBe("verbose");
    });

    it("should handle extra whitespace", () => {
      const result = parseCommand(baseState, "  /verbosity   terse  ");
      expect(result.isCommand).toBe(true);
      expect(result.state?.verbosity).toBe("terse");
    });

    it("should reject invalid verbosity levels", () => {
      const result = parseCommand(baseState, "/verbosity invalid");
      expect(result.isCommand).toBe(true);
      expect(result.message).toContain("Invalid verbosity level");
    });

    it("should preserve other state properties", () => {
      const stateWithData: State = {
        ...baseState,
        reply: "previous reply",
        messages: [{ role: "user", content: "test" }],
        inventory: ["sword"],
      };

      const result = parseCommand(stateWithData, "/verbosity verbose");
      expect(result.state?.reply).toBe("previous reply");
      expect(result.state?.messages).toEqual([
        { role: "user", content: "test" },
      ]);
      expect(result.state?.inventory).toEqual(["sword"]);
    });
  });

  describe("unknown commands", () => {
    it("should return error message for unknown command", () => {
      const result = parseCommand(baseState, "/unknown");
      expect(result.isCommand).toBe(true);
      expect(result.message).toContain("Unknown command");
    });
  });
});
