import { describe, it, beforeAll, expect } from "bun:test";
import { interact, type State } from "./world";

describe("verbosity system", () => {
  const baseSeed = 1;

  describe("terse verbosity", () => {
    let state: State;

    beforeAll(async () => {
      const initialState: State = {
        reply: "",
        messages: [],
        seed: baseSeed,
        inventory: [],
        verbosity: "terse",
      };

      state = await interact(
        initialState,
        "I open the ancient wooden door before me."
      );
    });

    it("produces brief responses", () => {
      // Terse responses should be notably short - under 100 characters
      const display = state.displayReply ?? state.reply;
      expect(display.length).toBeLessThan(100);
    });

    it("avoids excessive purple prose", () => {
      // Terse should be direct, not flowery
      // Check that it doesn't contain multiple dramatic adjectives in a row
      const display = state.displayReply ?? state.reply;
      const dramaticWords = [
        "ancient",
        "weathered",
        "mysterious",
        "ominous",
        "foreboding",
        "vast",
        "endless",
      ];
      const wordsInReply = dramaticWords.filter((word) =>
        display.toLowerCase().includes(word)
      );
      // Should have 1 or fewer dramatic words in terse mode
      expect(wordsInReply.length).toBeLessThanOrEqual(1);
    });

    it("stores verbose reply in conversation history", () => {
      // The actual reply stored should be verbose (long)
      expect(state.reply.length).toBeGreaterThan(150);
    });
  });

  describe("normal verbosity", () => {
    let state: State;

    beforeAll(async () => {
      const initialState: State = {
        reply: "",
        messages: [],
        seed: baseSeed,
        inventory: [],
        verbosity: "normal",
      };

      state = await interact(
        initialState,
        "I open the ancient wooden door before me."
      );
    });

    it("produces moderate responses with some drama", () => {
      // Normal should be between terse and verbose
      const display = state.displayReply ?? state.reply;
      expect(display.length).toBeGreaterThan(50);
      expect(display.length).toBeLessThan(400);
    });

    it("includes some descriptive language", () => {
      // Normal mode should have SOME drama but not excessive
      const display = state.displayReply ?? state.reply;
      const reply = display.toLowerCase();
      // Should contain at least one descriptive element
      const hasDescription =
        reply.includes("door") ||
        reply.includes("open") ||
        reply.includes("creak") ||
        reply.includes("dark");
      expect(hasDescription).toBe(true);
    });

    it("stores verbose reply in conversation history", () => {
      // The actual reply stored should be verbose (long)
      expect(state.reply.length).toBeGreaterThan(150);
    });
  });

  describe("verbose verbosity", () => {
    let state: State;

    beforeAll(async () => {
      const initialState: State = {
        reply: "",
        messages: [],
        seed: baseSeed,
        inventory: [],
        verbosity: "verbose",
      };

      state = await interact(
        initialState,
        "I open the ancient wooden door before me."
      );
    });

    it("produces detailed responses", () => {
      // Verbose should be notably longer (and displayReply === reply for verbose)
      const display = state.displayReply ?? state.reply;
      expect(display.length).toBeGreaterThan(150);
    });

    it("includes extensive descriptive language", () => {
      // Verbose should have multiple dramatic/descriptive words
      const display = state.displayReply ?? state.reply;
      const dramaticWords = [
        "ancient",
        "weathered",
        "mysterious",
        "ominous",
        "foreboding",
        "vast",
        "endless",
        "shadows",
        "darkness",
        "creak",
        "groan",
      ];
      const wordsInReply = dramaticWords.filter((word) =>
        display.toLowerCase().includes(word)
      );
      // Should have at least 2 dramatic words in verbose mode
      expect(wordsInReply.length).toBeGreaterThanOrEqual(2);
    });

    it("displayReply should equal reply for verbose mode", () => {
      // For verbose, no transformation needed
      expect(state.displayReply ?? state.reply).toBe(state.reply);
    });
  });

  describe("verbosity comparison", () => {
    let terseState: State;
    let normalState: State;
    let verboseState: State;

    beforeAll(async () => {
      const userAction = "I open the ancient wooden door before me.";

      terseState = await interact(
        {
          reply: "",
          messages: [],
          seed: baseSeed,
          inventory: [],
          verbosity: "terse",
        },
        userAction
      );

      normalState = await interact(
        {
          reply: "",
          messages: [],
          seed: baseSeed,
          inventory: [],
          verbosity: "normal",
        },
        userAction
      );

      verboseState = await interact(
        {
          reply: "",
          messages: [],
          seed: baseSeed,
          inventory: [],
          verbosity: "verbose",
        },
        userAction
      );
    });

    it("terse produces shorter displayed responses than normal", () => {
      const terseDisplay = terseState.displayReply ?? terseState.reply;
      const normalDisplay = normalState.displayReply ?? normalState.reply;
      expect(terseDisplay.length).toBeLessThan(normalDisplay.length);
    });

    it("verbose produces longer displayed responses than normal", () => {
      const verboseDisplay = verboseState.displayReply ?? verboseState.reply;
      const normalDisplay = normalState.displayReply ?? normalState.reply;
      expect(verboseDisplay.length).toBeGreaterThan(normalDisplay.length);
    });

    it("maintains ascending display length order: terse < normal < verbose", () => {
      const terseDisplay = terseState.displayReply ?? terseState.reply;
      const normalDisplay = normalState.displayReply ?? normalState.reply;
      const verboseDisplay = verboseState.displayReply ?? verboseState.reply;
      expect(terseDisplay.length).toBeLessThan(normalDisplay.length);
      expect(normalDisplay.length).toBeLessThan(verboseDisplay.length);
    });

    it("all states store verbose replies in conversation history", () => {
      // ALL states should have long verbose replies stored
      expect(terseState.reply.length).toBeGreaterThan(150);
      expect(normalState.reply.length).toBeGreaterThan(150);
      expect(verboseState.reply.length).toBeGreaterThan(150);
    });
  });
});
