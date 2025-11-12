import { describe, it, beforeAll, expect, setDefaultTimeout } from "bun:test";
import { interact, State } from "./world";
import { readFileSync } from "fs";
import { join } from "path";

// Increase timeout for LLM interactions
setDefaultTimeout(30000);

describe("Long Play - Inventory Management", () => {
  // Load the save file as a fixture
  const loadSaveFixture = (filename: string): State => {
    const savePath = join(import.meta.dir, "..", filename);
    return JSON.parse(readFileSync(savePath, "utf-8"));
  };

  describe("when player has picked up a rune-marked stone", () => {
    let initialState: State;
    let res: State;

    beforeAll(async () => {
      // Load the save file with the stone already picked up
      initialState = loadSaveFixture("epic-fantasy__777.json");

      // Verify the save has enough messages (long context test)
      expect(initialState.messages.length).toBeGreaterThan(100);

      // Test using the stone
      res = await interact(
        initialState,
        "I take out the rune-marked stone from my pocket and examine it"
      );
    });

    it("should remember the stone exists in long context", () => {
      expect(res.reply.toLowerCase()).toContain("stone");
      expect(res.reply.toLowerCase()).toContain("rune");
    });

    it("should not reject the action as invalid", () => {
      expect(res.reply).not.toContain("I won't allow that");
    });
  });

  describe("when player throws away an item", () => {
    let stateBeforeThrow: State;
    let stateAfterFirstThrow: State;
    let stateAfterSecondThrow: State;

    beforeAll(async () => {
      // Load the save file
      stateBeforeThrow = loadSaveFixture("epic-fantasy__777.json");

      // Throw the stone the first time
      stateAfterFirstThrow = await interact(
        stateBeforeThrow,
        "I throw the rune-marked stone as far as I can into the distance"
      );

      // Try to throw the same stone again
      stateAfterSecondThrow = await interact(
        stateAfterFirstThrow,
        "I throw the rune-marked stone again"
      );
    });

    it("should accept throwing the stone the first time", () => {
      expect(stateAfterFirstThrow.reply).toBeDefined();
      expect(stateAfterFirstThrow.reply.length).toBeGreaterThan(0);
      expect(stateAfterFirstThrow.reply).not.toContain("I won't allow that");
    });

    it("should reject throwing the stone a second time", () => {
      // The GM should realize from conversation history that the stone was already thrown
      const reply = stateAfterSecondThrow.reply.toLowerCase();
      const indicatesUnavailable =
        reply.includes("won't allow") ||
        reply.includes("don't have") ||
        reply.includes("no stone") ||
        reply.includes("already threw") ||
        reply.includes("already thrown") ||
        reply.includes("no longer have");

      expect(
        indicatesUnavailable,
        `Expected GM to reject throwing stone twice. Got: ${stateAfterSecondThrow.reply}`
      ).toBe(true);
    });
  });

  describe("when player interacts with multiple items", () => {
    let state: State;

    beforeAll(async () => {
      state = loadSaveFixture("epic-fantasy__777.json");
    });

    it("should track multiple items from conversation history", async () => {
      // The save file should have both a stone and potentially other items mentioned
      // Test that we can reference different items

      const res1 = await interact(
        state,
        "I check what items I have with me"
      );

      expect(res1.reply).toBeDefined();
      expect(res1.reply).not.toContain("I won't allow that");
    });

    it("should distinguish between different items", async () => {
      // First reference the stone
      const stoneResponse = await interact(
        state,
        "I examine the rune-marked stone"
      );

      // Then reference something else generic
      const otherResponse = await interact(
        stoneResponse,
        "I look around for other useful items"
      );

      expect(stoneResponse.reply).toBeDefined();
      expect(otherResponse.reply).toBeDefined();
      expect(otherResponse.reply).not.toContain("I won't allow that");
    });
  });

  describe("when testing long context stability", () => {
    it("should load save files with 100+ messages", () => {
      const state = loadSaveFixture("epic-fantasy__777.json");
      expect(state.messages.length).toBeGreaterThan(100);
      expect(state.seed).toBe(777);
    });

    it("should maintain conversation coherence after 100+ messages", async () => {
      const state = loadSaveFixture("epic-fantasy__777.json");

      const res = await interact(
        state,
        "I reflect on everything that has happened so far"
      );

      expect(res.reply).toBeDefined();
      expect(res.reply.length).toBeGreaterThan(10);
      expect(res.reply).not.toContain("I won't allow that");
    });
  });
});
