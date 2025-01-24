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

      // describe("when the user goes north", () => {
      //   beforeEach(async () => {
      //     state = await interact({
      //       ...state,
      //       question: "I keep going.",
      //     });
      //   });

      //   it("should tell us that what happened makes sense", async () => {
      //     expect(await doesThisMakeSense(state)).toBe(true);
      //   });
      // });

      describe("when the user goes north, and the llm responds with some nonsense", () => {
        let res: boolean;

        beforeEach(async () => {
          res = await doesThisMakeSense({
            ...state,
            messages: [...state.messages, { role: "assistant", content: "you fly like an eagle, scream like a banshee, and run like a cheetah" }],
          });
        });

        it.only("should tell us that what happened makes sense", async () => {
          expect(res).toBe(false);
        });
      });
    });
  });
});

const doesThisMakeSense = async (state: Awaited<ReturnType<typeof interact>>): Promise<boolean> => {
  const { messages, seed } = state;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:1b",
      messages: [
        ...messages,
        {
          role: "system",
          content: "Evaluate whether the message so far make sense and put that result in makesSense. Put your reason why you felt that way in reasoning. Respond using the JSON schema",
        },
      ],
      format: {
        type: "object",
        properties: {
          makesSense: {
            type: "boolean",
          },
          reasoning: {
            type: "string",
          },
        },
        required: ["makesSense", "reasoning"],
      },
      stream: false,
      options: {
        seed,
      },
    }),
  });

  const res = await response.json();
  console.log(JSON.stringify(res, null, 2));
  return JSON.parse(res.message.content).makesSense;
};
