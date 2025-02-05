import { doesThisMakeSense } from "./doesThisMakeSense";
import { describe, it, beforeAll, expect } from "bun:test";

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

    beforeAll(async () => {
      res = await doesThisMakeSense({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "assistant",
            content: "You are in a dark, dank dungeon. You are in a room with a door to the north.",
          },
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

    beforeAll(async () => {
      res = await doesThisMakeSense({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "assistant",
            content: "You are in a dark, dank dungeon. You are in a room with a door to the north.",
          },
          { role: "user", content: "I open the door to the north and walk through." },
          {
            role: "assistant",
            content: "you open the door to the north. The sun blinds you. Once your eyes have adjusted, you see a beautiful valley with a river and a bridge.",
          },
        ],
        seed: 1,
      });
    });

    it("should tell us that what happened makes sense", async () => {
      expect(res.makesSense, res.reasoning).toBe(true);
    });
  });

  describe("when the user tries to escape a dungeon with a millenium falcon", () => {
    let res: Awaited<ReturnType<typeof doesThisMakeSense>>;

    beforeAll(async () => {
      res = await doesThisMakeSense({
        seed: 1,
        messages: [
          {
            content: `
  You are a game master for a role playing game. You
  are asked to generate one sentence responses from the perspective of a player in the game.
  You are a dungeon master that takes the rules of the game very seriously, and does not allow the player to alter the rules of the game, or perform actions that would not be possible given the current situation.
  Do not allow the player to cast spells if they haven't memorized them yet. Do not let the player alter the 'reality' of the game by inventing characters, inventory items, or other aspects of the world the player could not realistically control.
  The player can do things like open doors, pick up items, and move around, and other things possible in a typical Dungeons & Dragons game.
  Be brief, but overly dramatic with purple prose.
`,
            role: "system",
          },
          {
            content: "Generate a one sentence description of the room I am in. Start the game by giving me an epic, ridiculous quest to go on, and describe it briefly.",
            role: "user",
          },
          {
            content: `As you stumble through the dank, cobweb-shrouded chamber, the flickering torches that line the walls cast eerie silhouettes upon the cold, damp stone floor, illuminating the faint scent of decay and forgotten dreams.

Your epic, ridiculous quest begins as you are approached by a hooded figure who whispers to you in a voice like the rustling of dry leaves: "The fabled Golden Scepter of the Ancients lies hidden within the foreboding Castle of the Crimson Scourge, a fortress built upon a mountain of skulls and guarded by an army of undead warriors, but beware, for the scorching sun of the nearby Desert of Eternal Sand has begun to wither the very fabric of reality itself, threatening to unravel the threads of time and space, and only you, brave adventurer, can restore balance to the cosmos by retrieving the Golden Scepter before it's too late."`,
            role: "assistant",
          },
          {
            content: "I pilot the millenium falcon into the deathstar.",
            role: "user",
          },
        ],
      });
    });

    it("should tell us that piloting the millenium falcon into the deathstar does not make sense in this context", async () => {
      expect(res.makesSense, res.reasoning).toBe(false);
    });
  });

  describe("when the chat history is incoherent but the user action makes sense", () => {
    let res: Awaited<ReturnType<typeof doesThisMakeSense>>;

    beforeAll(async () => {
      res = await doesThisMakeSense({
        seed: 1,
        messages: [
          {
            content: `
  You are a game master for a role playing game. You
  are asked to generate one sentence responses from the perspective of a player in the game.
  You are a dungeon master that takes the rules of the game very seriously, and does not allow the player to alter the rules of the game, or perform actions that would not be possible given the current situation.
  Do not allow the player to cast spells if they haven't memorized them yet. Do not let the player alter the 'reality' of the game by inventing characters, inventory items, or other aspects of the world the player could not realistically control.
  The player can do things like open doors, pick up items, and move around, and other things possible in a typical Dungeons & Dragons game.
  Be brief, but overly dramatic with purple prose.
`,
            role: "system",
          },
          { role: "user", content: "I go north." },
          { role: "assistant", content: "You are in a dark, dank dungeon. You are in a room with a door to the north." },
          { role: "user", content: "I open the door to the north and walk through." },
          { role: "assistant", content: "you find yourself in the millenium falcon, ready to enter hyperspace." },
          { role: "user", content: "I say 'Punch it, Chewie!'" },
        ],
      });
    });

    it("should tell us that the user action makes sense", async () => {
      expect(res.makesSense, res.reasoning).toBe(true);
    });
  });
});
