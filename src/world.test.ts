import { doesThisMakeSense } from "./doesThisMakeSense";
import { generateWorld, interact } from "./world";
import { describe, it, beforeEach, expect } from "bun:test";
import "./expectToMakeSense";

describe("world", () => {
  describe("generateWorld", () => {
    let world: Awaited<ReturnType<typeof generateWorld>>;

    beforeEach(async () => {
      world = await generateWorld({ seed: 0 });
    });

    it("should generate a world", async () => {
      expect(world.reply).toBeDefined();
    });
  });

  describe("generateWorld with seed when called twice", () => {
    let world1: Awaited<ReturnType<typeof generateWorld>>;
    let world2: Awaited<ReturnType<typeof generateWorld>>;

    beforeEach(async () => {
      world1 = await generateWorld({ seed: 1 });
      world2 = await generateWorld({ seed: 1 });
    });

    it("should generate the same world", async () => {
      expect(world1).toEqual(world2);
    });
  });

  describe.only("Given a world", () => {
    let state: Awaited<ReturnType<typeof interact>>;

    beforeEach(async () => {
      state = await generateWorld({ seed: 1 });
    });

    describe("when the user goes north", () => {
      beforeEach(async () => {
        state = await interact({
          ...state,
          question: "I go north.",
        });
      });

      // it("should reply that there are secrets of the cosmos", () => {
      //   expect(state.reply, JSON.stringify(state, null, 2)).toContain("the secrets of the cosmos");
      // });

      describe("when the user goes north", () => {
        beforeEach(async () => {
          state = await interact({
            ...state,
            question: "I keep going.",
          });
        });

        it("should tell us that what happened makes sense", async () => {
          // expect(state).toMakeSense();
          await expect(state).toMakeSense();
        });
      });
    });
  });
});
