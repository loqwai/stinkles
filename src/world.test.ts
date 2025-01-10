import { generateWorld } from "./world";
import { describe, it, beforeEach, expect } from "bun:test";

describe("world", () => {
  describe("generateWorld", () => {
    let world: string;

    beforeEach(async () => {
      world = await generateWorld({ seed: 0 });
    });

    it("should generate a world", async () => {
      expect(world).toBeDefined();
    });
  });

  describe("generateWorld with seed when called twice", () => {
    let world1: string;
    let world2: string;

    beforeEach(async () => {
      world1 = await generateWorld({ seed: 1 });
      world2 = await generateWorld({ seed: 1 });
    });

    it("should generate the same world", async () => {
      expect(world1).toEqual(world2);
    });
  });

  describe("when the user asks what is in a room", () => {});
});
