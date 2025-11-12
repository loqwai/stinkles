import { interact } from "./world";

export const doesThisMakeSense = async (state: State): Promise<Result> => {
  const { messages, seed } = state;

  // Check if context is empty (no assistant messages with scene descriptions)
  const hasContext = messages.some(
    (msg) => msg.role === "assistant" && msg.content.trim().length > 0
  );

  if (!hasContext) {
    // No context established - check if it's a meta request
    const latestUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");

    if (latestUserMessage) {
      const content = latestUserMessage.content.toLowerCase();
      const isMetaRequest =
        content.includes("generate") ||
        content.includes("describe") ||
        content.includes("start");

      if (isMetaRequest) {
        return {
          makesSense: true,
          reasoning: "Meta-request to generate content is always valid",
        };
      } else {
        return {
          makesSense: false,
          reasoning:
            "No game context established - player must request scene generation first",
        };
      }
    }
  }

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1:8b",
      messages: [
        ...messages,
        {
          role: "system",
          content: `
          Analyze the latest USER message and determine if it's a valid action in the game.

          KEY RULES:
          1. ALWAYS accept requests for the game master to describe/generate content (these are meta-game and always valid)
          2. Accept the current game state AS-IS from the assistant's messages (don't question game logic)
          3. For player actions: check ONLY if physically possible for a normal person - do NOT evaluate if it's strategically good or will succeed
          4. Reject when player invents items, characters, or does impossible things
          5. IMPORTANT: Don't judge if an action is "smart" or "will work" - only if it's physically possible

          VALID INPUTS:
          - Meta requests: "Generate...", "Describe...", "Start the game..." → ALWAYS true
          - Speech/dialogue: "I say...", any quoted dialogue, verbal commands → ALWAYS true (speaking is always possible)
          - Physical attempts: "I take/pick up/grab/open/examine/touch/move/eat/drink/break..." → true (attempting is valid, game decides if it succeeds)
          - Movement: "I go north", "I walk to...", "I enter..." → true
          - Basic actions: eating, drinking, sleeping, sitting, standing, running → true (normal human actions)
          - Actions fitting bizarre contexts: If in spaceship, actions make sense in that context

          INVALID INPUTS:
          - Impossible physical abilities: "I fly", "I teleport", "I phase through walls" (without magic/special abilities)
          - Creating things from nothing: "I summon a dragon", "I invent a laser gun", "A magical sword appears"
          - Controlling NPCs/environment: "The guard lets me pass", "The door opens by itself", "The king gives me treasure"

          Provide your analysis:
          - "makesSense": true if valid (meta-request OR possible action in current context)
          - "reasoning": Brief explanation

          CRITICAL: "makesSense" means "is this physically possible?" NOT "is this a good idea?" or "is this safe?"
          A player can attempt to eat poison, jump off a cliff, or pet a dragon - these are all VALID attempts.
          The game master decides the consequences.

          Examples:
          - "Generate a description..." → true (meta-request)
          - "I take the sword" → true (attempting to take is valid)
          - "I eat the pastry" → true (eating is a normal action, even if it's a bad idea)
          - "I drink the potion" → true (drinking is physically possible)
          - "I fly like an eagle" → false (impossible ability)
          - "I summon a dragon" → false (creating from nothing)
          - "The guard steps aside" → false (controlling NPC)
          - "Punch it!" (dialogue) → true (speech always valid)

          REMEMBER: Your job is to validate if an action is POSSIBLE, not if it's WISE. The game master decides outcomes.
          `,
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
        temperature: 0.5,
      },
    }),
  });

  const res = await response.json();
  return JSON.parse(res.message.content);
};

interface State {
  messages: { role: string; content: string }[];
  seed: number;
}

interface Result {
  makesSense: boolean;
  reasoning: string;
}
