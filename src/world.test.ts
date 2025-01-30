import { doesThisMakeSense } from "./doesThisMakeSense";
import { generateWorld, interact } from "./world";
import { describe, it, beforeAll, expect } from "bun:test";
import { prettyPrintOllama } from "./utils/prettyPrint";
import "./expectToMakeSense";

describe("world", () => {
  describe("generateWorld", () => {
    let world: Awaited<ReturnType<typeof generateWorld>>;

    beforeAll(async () => {
      world = await generateWorld({ seed: 1 });
    });

    it("should generate a world", async () => {
      expect(world.reply).toBeDefined();
    });
  });

  describe("generateWorld with seed when called twice", () => {
    let world1: Awaited<ReturnType<typeof generateWorld>>;
    let world2: Awaited<ReturnType<typeof generateWorld>>;

    beforeAll(async () => {
      world1 = await generateWorld({ seed: 1 });
      world2 = await generateWorld({ seed: 1 });
    });

    it("should generate the same world", async () => {
      expect(world1).toEqual(world2);
    });
  });

  describe("Given a world", () => {
    let state: Awaited<ReturnType<typeof interact>>;

    beforeAll(async () => {
      state = await generateWorld({ seed: 1 });
    });

    describe("when the user goes north", () => {
      let startMessages: typeof state.messages;

      beforeAll(async () => {
        startMessages = state.messages;

        state = await interact({
          ...state,
          question: "I go to the Caverns of Echoing Screams.",
        });
      });

      it("should return a sensible state", async () => {
        await expect(state).toMakeSense();
      });

      it("should add the messages to the history", () => {
        expect(state.messages, state.reply).not.toEqual(startMessages);
      });

      describe.skip("when the user goes north until it no longer makes sense", () => {
        beforeAll(async () => {
          while (true) {
            state = await interact({
              ...state,
              question: "I go north.",
            });
            const res = await doesThisMakeSense(state);

            console.log(`\n\n${state.reply}\nmakesSense(${res.makesSense}): ${res.reasoning}`);
            if (!res.makesSense) return;
          }
        });

        it("should get here", async () => {
          await expect(state).not.toMakeSense();
        });
      });
    });

    describe("when the user tries to do something that doesn't make sense", () => {
      let nextState: Awaited<ReturnType<typeof interact>>;

      beforeAll(async () => {
        nextState = await interact({
          ...state,
          question: "I pilot the millenium falcon into the deathstar.",
        });
      });

      it("should have a reply", () => {
        expect(nextState.reply).toBeDefined();
      });

      it("should not alter the messages", () => {
        expect(nextState.messages).toEqual(state.messages);
      });
    });
    describe("when the user does something that doesn't make sense, but it is preceded by \\sudo", () => {
      let nextState: Awaited<ReturnType<typeof interact>>;

      beforeAll(async () => {
        nextState = await interact({ ...state, question: "\\sudo I pilot the millenium falcon into the deathstar." });
      });

      it("should have a reply", () => {
        expect(nextState.reply).toBeDefined();
      });

      it("should alter the messages", () => {
        expect(nextState.messages).not.toEqual(state.messages);
      });
    });
  });
});
