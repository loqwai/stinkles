import { strict as assert } from "assert";
import { doesThisMakeSense } from "./doesThisMakeSense";
import { summarizeResponse } from "./summarizeResponse";
import { readFileSync } from "fs";
import { join } from "path";

export type Verbosity = "terse" | "normal" | "verbose";

export interface State {
  reply: string; // The verbose reply stored in conversation history
  displayReply?: string; // The reply shown to user (transformed based on verbosity)
  messages: { role: string; content: string }[];
  seed: number;
  inventory: any[];
  verbosity?: Verbosity;
  basePrompt?: string; // Optional custom base prompt
}

const DEFAULT_BASE_PROMPT = `You are a game master for a role playing game. You are asked to generate responses from the perspective of a player in the game.
You are a dungeon master that takes the rules of the game very seriously, and does not allow the player to alter the rules of the game.
Do not allow the player to cast spells if they haven't memorized them yet. Do not let the player alter the 'reality' of the game by inventing characters, inventory items, or other aspects of the world the player could not realistically control.
The player can do things like open doors, pick up items, and move around, and other typical RPG things.`;

export const loadPromptFromFile = (promptFile: string): string => {
  try {
    return readFileSync(promptFile, "utf-8").trim();
  } catch (error) {
    throw new Error(`Failed to load prompt file: ${promptFile}`);
  }
};

export const getPrompt = (
  verbosity: Verbosity = "normal",
  basePrompt?: string
): string => {
  const base = basePrompt ?? DEFAULT_BASE_PROMPT;

  switch (verbosity) {
    case "terse":
      return `${base}

  RESPONSE STYLE: Be extremely brief and direct. Use one short sentence maximum (under 15 words). Skip all purple prose, flowery language, and dramatic descriptions. Be concise and to-the-point.`;
    case "verbose":
      return `${base}

  RESPONSE STYLE: You MUST write AT LEAST 3-5 paragraphs with extensive purple prose. Be maximally descriptive and dramatic with vivid sensory details. Paint a rich picture with elaborate descriptions of sights, sounds, textures, and atmosphere. Layer multiple dramatic adjectives and use poetic, flowing language. Expand your responses with world-building details, atmospheric descriptions, and epic storytelling. DO NOT write short responses - always elaborate extensively.`;
    case "normal":
    default:
      return `${base}

  RESPONSE STYLE: Be brief, but overly dramatic with purple prose. One to two sentences with some flair.`;
  }
};

// Keep the old export for backwards compatibility during migration
export const prompt = getPrompt("normal");

export const generateWorld = async ({
  seed,
  verbosity = "normal",
  basePrompt,
}: {
  seed: number;
  verbosity?: Verbosity;
  basePrompt?: string;
}): Promise<State> => {
  const initialState: State = {
    reply: "",
    messages: [
      {
        role: "system",
        content: getPrompt("verbose", basePrompt), // Always generate verbose
      },
    ],
    seed,
    inventory: [],
    verbosity, // But remember user's preference for display
    basePrompt, // Store for future interactions
  };

  return await interact(
    initialState,
    "Generate a one sentence description of the room I am in. Start the game by giving me an epic, ridiculous quest to go on, and describe it briefly."
  );
};

export const interact = async (
  state: State,
  userInput: string
): Promise<State> => {
  const verbosity = state.verbosity ?? "normal";
  const messages = structuredClone(state.messages);

  // ALWAYS generate with verbose prompt for rich conversation history
  if (messages.length === 0 || messages[0].role !== "system") {
    messages.unshift({
      role: "system",
      content: getPrompt("verbose", state.basePrompt),
    });
  } else {
    // Update existing system message to verbose
    messages[0].content = getPrompt("verbose", state.basePrompt);
  }

  messages.push({ role: "user", content: userInput });

  const res = await doesThisMakeSense({ messages, seed: state.seed });
  if (!res.makesSense) {
    const errorMsg = `I won't allow that because ${res.reasoning}`;
    return {
      ...state,
      reply: errorMsg,
      displayReply: errorMsg,
      messages: state.messages,
    };
  }

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:latest",
      messages,
      stream: false,
      options: {
        seed: state.seed,
        temperature: 0.5,
        num_predict: 512, // Ensure verbose responses have room to be detailed
      },
    }),
  });

  assert(response.ok, "Failed to interact: " + response.statusText);

  const json = await response.json();
  messages.push(json.message);
  const verboseReply = json.message.content;

  // Transform the verbose reply for display based on user preference
  let displayReply = verboseReply;
  if (verbosity === "terse" || verbosity === "normal") {
    displayReply = await summarizeResponse(
      verboseReply,
      verbosity,
      state.seed
    );
  }

  return {
    ...state,
    reply: verboseReply, // Always store verbose in history
    displayReply, // What the user sees
    messages,
  };
};
