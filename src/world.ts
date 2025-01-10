import { strict as assert } from "assert";

export const generateWorld = async ({ seed }: { seed: number }) => {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      messages: [
        {
          role: "system",
          content: `
            You are a game master for a role playing game. You are having a conversation with a player. You
            are asked to generate one sentence responses from the perspective of a player in the game.
          `,
        },
        {
          role: "user",
          content: `Generate a one sentence description of the room I am in`,
        },
      ],
      stream: false,
      options: {
        seed,
      },
    }),
  });

  assert(response.ok, "Failed to generate world: " + response.statusText);

  const json = await response.json();
  const content = json.message.content;
  console.log(content);
  return content;
};
