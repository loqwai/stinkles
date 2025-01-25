import { doesThisMakeSense } from "./doesThisMakeSense";
import { describe, it, beforeEach, expect } from "bun:test";
describe("doesThisMakeSense", () => {
  const prompt = `
    You are a game master for a role playing game. You
    are asked to generate one sentence responses from the perspective of a player in the game.
    You are a dungeon master that takes the rules of the game very seriously, and does not allow the player to alter the rules of the game, or perform actions that would not be possible given the current situation.
    Do not allow the player to cast spells if they haven't memorized them yet. Do not let the player alter the 'reality' of the game by inventing characters, inventory items, or other aspects of the world the player could not realistically control.

    Be brief, but overly dramatic with purple prose.
  `;

  describe("when the user goes north, and the llm responds with some nonsense", () => {
    let res: Awaited<ReturnType<typeof doesThisMakeSense>>;

    beforeEach(async () => {
      res = await doesThisMakeSense({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          { role: "assistant", content: "You are in a dark, dank dungeon. You are in a room with a door to the north." },
          { role: "user", content: "I open the door to the north and walk through." },
          { role: "assistant", content: "you fly like an eagle, scream like a banshee, and run like a cheetah" },
        ],
        seed: 1,
      });
    });

    it("should tell us that what happened does not make sense", async () => {
      expect(res.makesSense, res.reasoning).toBe(false);
    });
  });

  describe("when the user goes north, and the llm responds with a sensible response", () => {
    let res: Awaited<ReturnType<typeof doesThisMakeSense>>;

    beforeEach(async () => {
      res = await doesThisMakeSense({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          { role: "assistant", content: "You are in a dark, dank dungeon. You are in a room with a door to the north." },
          { role: "user", content: "I open the door to the north and walk through." },
          { role: "assistant", content: "you open the door to the north. The sun blinds you. Once your eyes have adjusted, you see a beautiful valley with a river and a bridge." },
        ],
        seed: 1,
      });
    });

    it("should tell us that what happened makes sense", async () => {
      expect(res.makesSense, res.reasoning).toBe(true);
    });
  });
});
