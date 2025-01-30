import { strict as assert } from "assert";
import { doesThisMakeSense } from "./doesThisMakeSense";

export const prompt = `
  You are a game master for a role playing game. You
  are asked to generate one sentence responses from the perspective of a player in the game.
  You are a dungeon master that takes the rules of the game very seriously, and does not allow the player to alter the rules of the game.
  Do not allow the player to cast spells if they haven't memorized them yet. Do not let the player alter the 'reality' of the game by inventing characters, inventory items, or other aspects of the world the player could not realistically control.
  The player is free to do anything that is physically possible given the fantasy setting and the rules of the game. Any behavior, however implausible, is allowed.
  The player can lie, act out of character, and perform any other action that may seem illogical, as long as they are physically possible.
  For example, the player can suddenly accuse a villager of being a spy, or claim that they have a magic sword that can cut through anything.
  The player can do things like open doors, pick up items, and move around, and other typical RPG things.
  Be brief, but overly dramatic with purple prose.
`;

export const generateWorld = async ({ seed }: { seed: number }) => {
  const messages = [
    {
      role: "system",
      content: prompt,
    },
  ];

  return await interact({
    question: "where am I?",
    messages: structuredClone(messages),
    seed,
  });
};

export const interact = async ({ question, messages: originalMessages, seed }: { question: string; messages: { role: string; content: string }[]; seed: number }) => {
  const messages = structuredClone(originalMessages);
  const isSudo = question.startsWith("\\sudo");
  if (isSudo) {
    const command = question.slice(5);
    messages.push({ role: "user", content: command });
    messages.push({ role: "assistant", content: "sure, why not? here's what happens next:" });
  } else {
    messages.push({ role: "user", content: question });

    const res = await doesThisMakeSense({ messages, seed });
    if (!res.makesSense) {
      return { reply: `I won't allow that because ${res.reasoning}`, messages: originalMessages, seed, inventory: [] };
    }
  }

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "taozhiyuai/llama-3-8b-ultra-instruct:q8_0",
      messages,
      stream: false,
      options: { seed, temperature: 0.5 },
    }),
  });

  assert(response.ok, "Failed to interact: " + response.statusText);

  const json = await response.json();
  messages.push(json.message);
  const reply = json.message.content;
  return { reply, messages, seed, inventory: [] };
};
