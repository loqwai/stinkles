import { generateWorld, interact } from "./world";
import { describe, it, beforeEach, expect } from "bun:test";

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

  describe("Given a world", () => {
    let state: Awaited<ReturnType<typeof interact>>;

    beforeEach(async () => {
      state = await generateWorld({ seed: 1 });
    });

    describe("Given a world, when the user asks what is in a room", () => {
      beforeEach(async () => {
        state = await interact({
          ...state,
          question: "What is in the room?",
        });
      });

      it("should reply that there is a chest in the room", () => {
        expect(state.reply).toContain("chest");
      });

      describe("When the user opens the chest", () => {
        beforeEach(async () => {
          state = await interact({
            ...state,
            question: "Open the chest",
          });
        });

        it("should reply that there is a key in the chest", () => {
          expect(state.reply).toContain("key");
        });

        // describe("When the user takes the key", () => {
        //   beforeEach(async () => {
        //     state = await interact({
        //       ...state,
        //       question: "Take the key",
        //     });
        //   });

        //   it("should call the addItemToInventory tool", () => {
        //     expect(state.inventory).toContain("key");
        //   });
        // });
      });
    });
  });
});
