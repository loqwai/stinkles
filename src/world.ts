import { strict as assert } from "assert";

export const generateWorld = async ({ seed }: { seed: number }) => {
  const messages = [
    {
      role: "system",
      content: `
        You are a game master for a role playing game. You are having a conversation with a player. You
        are asked to generate one sentence responses from the perspective of a player in the game.
        You are a dungeon master that takes the rules of the game very seriously, and does not allow the player to alter the rules of the game, or perform actions that would not be possible given the current situation.
        Do not allow the player to cast spells if they haven't memorized them yet. Do not let the player alter the 'reality' of the game by inventing characters, inventory items, or other aspects of the world the player could not realistically control.

      `,
    },
    {
      role: "user",
      content: `Generate a one sentence description of the room I am in. Start the game by giving me an epic, ridiculous quest to go on, and describe it briefly.`,
    },
  ];

  return await interact({
    question: "Generate a one sentence description of the room I am in",
    messages,
    seed,
  });
};

export const interact = async ({
  question,
  messages,
  seed,
}: {
  question: string;
  messages: { role: string; content: string }[];
  seed: number;
}) => {
  messages.push({ role: "user", content: question });

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      messages,
      stream: false,
      options: {
        seed,
      },
      // tools: [
      //   {
      //     name: "addItemToInventory",
      //     description: "Add an item to the player's inventory",
      //     parameters: {
      //       type: "object",
      //       properties: { item: { type: "string" } },
      //     },
      //   },
      // ],
    }),
  });

  assert(response.ok, "Failed to interact: " + response.statusText);

  const json = await response.json();
  messages.push(json.message);
  const reply = json.message.content;
  return { reply, messages, seed, inventory: [] };
};
