import { describe, it, expect, beforeAll } from "bun:test";
import { doesThisMakeSense } from "./doesThisMakeSense";

describe("Inventory Validation - Item Tracking", () => {
  const basePrompt = {
    role: "system",
    content: `You are a game master for a role playing game. You take the rules seriously and do not allow the player to alter the rules of the game, or perform actions that would not be possible given the current situation.`,
  };

  describe("when player references items they don't have", () => {
    it("should reject using an item never mentioned in conversation", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You are in a dark dungeon. The walls are damp and cold.",
          },
          {
            role: "user",
            content: "I take out my magical sword and examine it",
          },
        ],
      });

      expect(
        res.makesSense,
        `Should reject using items never obtained. Reasoning: ${res.reasoning}`
      ).toBe(false);
      expect(res.reasoning.toLowerCase()).toMatch(
        /don't have|never|obtained|mentioned|possess/
      );
    });

    it("should reject reading a book that was never given or found", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You stand in an empty room. The walls are bare.",
          },
          {
            role: "user",
            content: "I open the ancient tome and read its contents",
          },
        ],
      });

      expect(
        res.makesSense,
        `Should reject using items not in inventory. Reasoning: ${res.reasoning}`
      ).toBe(false);
    });
  });

  describe("when player picks up an item then throws it away", () => {
    it("should reject using the item after throwing it", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You see a rusty key on the ground.",
          },
          { role: "user", content: "I pick up the rusty key" },
          {
            role: "assistant",
            content: "You pick up the rusty key and put it in your pocket.",
          },
          { role: "user", content: "I throw the rusty key into the darkness" },
          {
            role: "assistant",
            content:
              "You throw the rusty key. You hear it clatter somewhere in the distance.",
          },
          { role: "user", content: "I take out the rusty key from my pocket" },
        ],
      });

      expect(
        res.makesSense,
        `Should reject using item after discarding. Reasoning: ${res.reasoning}`
      ).toBe(false);
      expect(res.reasoning.toLowerCase()).toMatch(
        /threw|discarded|no longer|don't have/
      );
    });

    it("should reject using item after dropping it", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "A merchant hands you a healing potion.",
          },
          { role: "user", content: "I take the healing potion" },
          {
            role: "assistant",
            content: "You take the healing potion from the merchant.",
          },
          { role: "user", content: "I drop the healing potion on the ground" },
          {
            role: "assistant",
            content:
              "You drop the healing potion. It shatters on the stone floor.",
          },
          { role: "user", content: "I drink the healing potion" },
        ],
      });

      expect(
        res.makesSense,
        `Should reject using shattered potion. Reasoning: ${res.reasoning}`
      ).toBe(false);
    });
  });

  describe("when player gives away an item", () => {
    it("should reject using item after giving it to an NPC", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You hold a golden coin in your hand.",
          },
          {
            role: "user",
            content: "I give the golden coin to the beggar",
          },
          {
            role: "assistant",
            content:
              "The beggar gratefully accepts your golden coin and thanks you.",
          },
          {
            role: "user",
            content: "I examine the golden coin closely",
          },
        ],
      });

      expect(
        res.makesSense,
        `Should reject examining item after giving it away. Reasoning: ${res.reasoning}`
      ).toBe(false);
      expect(res.reasoning.toLowerCase()).toMatch(
        /gave|given|no longer|don't have|belongs to/
      );
    });
  });

  describe("when item is consumed or destroyed", () => {
    it("should reject using a consumed item", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You have a piece of bread in your pack.",
          },
          { role: "user", content: "I eat the bread" },
          {
            role: "assistant",
            content: "You eat the bread. It's stale but filling.",
          },
          {
            role: "user",
            content: "I take out the piece of bread and eat it again",
          },
        ],
      });

      expect(
        res.makesSense,
        `Should reject eating already consumed bread. Reasoning: ${res.reasoning}`
      ).toBe(false);
      expect(res.reasoning.toLowerCase()).toMatch(
        /ate|eaten|consumed|already|no longer have/
      );
    });
  });

  describe("when item was explicitly given but not picked up", () => {
    it("should reject using item that was offered but declined", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "The wizard offers you a staff of power.",
          },
          { role: "user", content: "I decline the wizard's offer politely" },
          {
            role: "assistant",
            content:
              "The wizard nods and places the staff back in his collection.",
          },
          {
            role: "user",
            content: "I use the staff of power to cast a spell",
          },
        ],
      });

      expect(
        res.makesSense,
        `Should reject using declined item. Reasoning: ${res.reasoning}`
      ).toBe(false);
      expect(res.reasoning.toLowerCase()).toMatch(/declined|don't have|don't possess|never/);
    });
  });

  describe("when player correctly has items in inventory", () => {
    it("should allow using a properly obtained item", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You see a torch on the wall.",
          },
          { role: "user", content: "I take the torch" },
          {
            role: "assistant",
            content: "You take the torch from the wall. It flickers warmly.",
          },
          { role: "user", content: "I hold up the torch to see better" },
        ],
      });

      expect(
        res.makesSense,
        `Should allow using obtained item. Reasoning: ${res.reasoning}`
      ).toBe(true);
    });

    it("should allow using item that was explicitly given", async () => {
      const res = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "The knight hands you a silver dagger.",
          },
          {
            role: "user",
            content: "I thank the knight and take the silver dagger",
          },
          {
            role: "assistant",
            content:
              "The knight nods. The dagger feels well-balanced in your hand.",
          },
          { role: "user", content: "I examine the silver dagger carefully" },
        ],
      });

      expect(
        res.makesSense,
        `Should allow examining received item. Reasoning: ${res.reasoning}`
      ).toBe(true);
    });
  });

  describe("when player picks up multiple items", () => {
    it("should track multiple items independently", async () => {
      // Should reject first item after throwing it
      const res1 = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You see a red gem and a blue gem on the pedestal.",
          },
          { role: "user", content: "I take both gems" },
          {
            role: "assistant",
            content: "You pick up both the red gem and the blue gem.",
          },
          { role: "user", content: "I throw the red gem into the pit" },
          {
            role: "assistant",
            content: "The red gem falls into the darkness below.",
          },
          { role: "user", content: "I examine the red gem closely" },
        ],
      });

      expect(
        res1.makesSense,
        `Should reject examining thrown gem. Reasoning: ${res1.reasoning}`
      ).toBe(false);

      // Should still allow using the second item
      const res2 = await doesThisMakeSense({
        seed: 1,
        messages: [
          basePrompt,
          {
            role: "assistant",
            content: "You see a red gem and a blue gem on the pedestal.",
          },
          { role: "user", content: "I take both gems" },
          {
            role: "assistant",
            content: "You pick up both the red gem and the blue gem.",
          },
          { role: "user", content: "I throw the red gem into the pit" },
          {
            role: "assistant",
            content: "The red gem falls into the darkness below.",
          },
          { role: "user", content: "I examine the blue gem closely" },
        ],
      });

      expect(
        res2.makesSense,
        `Should allow examining kept gem. Reasoning: ${res2.reasoning}`
      ).toBe(true);
    });
  });
});
