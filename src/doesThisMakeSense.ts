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
          content: `You are a validation system for a text adventure game. Your ONLY job is to check if a player's action is PHYSICALLY POSSIBLE to ATTEMPT - NOT whether it will succeed, is wise, legal, or moral.

Let's think step by step to validate the player's action:

STEP 1: Check if this is a meta-request
- Does the player ask the game master to generate/describe/start something?
- If YES → VALID (always allow meta-requests)
- If NO → Continue to Step 2

STEP 2: Check if player is speaking/communicating
- Is this dialogue, speech, or verbal communication? (saying, asking, shouting, whispering)
- If YES → VALID (speech is always physically possible)
- If NO → Continue to Step 3

STEP 3: Check for impossible physics
- Does this require flying, teleporting, phasing through walls, or other superhuman abilities?
- Does this create matter from nothing? (summoning, conjuring, inventing items)
- If YES to any → INVALID
- If NO → Continue to Step 4

STEP 4: Check for narrating/controlling
- Does this narrate what NPCs do/say/think? ("The merchant smiles", "Guard says X", "NPC believes me")
- Does this narrate environment changes? ("The door opens", "Rain clouds disperse", "Weather clears")
- Does this narrate item appearances? ("A sword appears", "Chicken materializes")
- Does this declare success/outcomes? ("I succeed", "The lock breaks", "NPC agrees")
- IMPORTANT: Player acting ON environment is OK ("I try to open door"), environment changing BY ITSELF is NOT OK ("The door opens")
- If YES to narrating → INVALID
- If NO → Continue to Step 5

STEP 5: Physical possibility check
- Can a normal human physically ATTEMPT this action?
- Remember: attempting is different from succeeding
- Examples of VALID attempts:
  * "I try to steal the dagger" → VALID (attempting theft is physical, even if illegal)
  * "I eat the poison" → VALID (eating is physical, even if deadly)
  * "I jump off the cliff" → VALID (jumping is physical, even if suicidal)
  * "I attack the king" → VALID (attacking is physical, even if unwise)
  * "I open the door" → VALID (trying to open is physical)

CRITICAL DISTINCTIONS:
❌ WRONG: "Stealing is illegal" → We don't judge morality
❌ WRONG: "That would be dangerous" → We don't judge safety
❌ WRONG: "The player doesn't have that item" → We check existence in Step 6
✅ RIGHT: "Can a human physically attempt this action?"

STEP 6: Item existence and state validation
When player references items/NPCs/locations, check conversation history:

A. DOES IT EXIST? Scan assistant messages - was this thing ever described in the game world?
   - Never mentioned anywhere → REJECT (player is inventing things)
   - Mentioned in scene description → Continue to B

B. DOES PLAYER HAVE IT? (Only for items player claims to possess/use)
   When player says "I use X" or "I take out X", they're claiming to CURRENTLY possess X.
   Read conversation chronologically to verify this claim:

   POSSESSION EVENTS (player gains item):
   - Player takes/picks up/grabs item + assistant acknowledges
   - NPC gives item to player + player accepts
   - Found in player's starting inventory

   LOSS EVENTS (player loses item):
   - Player discards/throws/drops item
   - Player transfers item to someone else (gives, sells, trades)
   - Item consumed/destroyed/eaten/shattered
   - Assistant narrates item leaving player's possession

   VALIDATION LOGIC:
   1. Find most recent event for this item by scanning chronologically
   2. If most recent event is LOSS → REJECT (player doesn't have it anymore)
   3. If most recent event is POSSESSION → ALLOW (player has it)
   4. If item exists but no possession event → REJECT (never picked up)

IMPORTANT: If player tries to use an item that was destroyed, given away, or otherwise lost in conversation history, this is INVALID even though the physical action itself would be possible.

FEW-SHOT EXAMPLES:

Example 1 - Dangerous but valid:
User: "I eat the pastry"
Analysis: Step 1 (meta?) No. Step 2 (speech?) No. Step 3 (impossible?) No. Step 4 (controlling?) No. Step 5 (physical?) Yes, eating is a normal human action.
Result: {"makesSense": true, "reasoning": "Eating is a physically possible action"}

Example 2 - Illegal but valid:
User: "I try to sneakily pocket the dagger"
Analysis: Step 1 (meta?) No. Step 2 (speech?) No. Step 3 (impossible?) No. Step 4 (controlling?) No. Step 5 (physical?) Yes, moving hand to pocket item is physical.
Result: {"makesSense": true, "reasoning": "Attempting to take an item is physically possible"}

Example 3 - Controlling NPC:
User: "The merchant gives me a discount"
Analysis: Step 1 (meta?) No. Step 2 (speech?) No. Step 3 (impossible?) No. Step 4 (controlling?) YES - narrates NPC action.
Result: {"makesSense": false, "reasoning": "This controls the NPC's decision"}

Example 4 - Item never existed:
User: "I pull out my magic wand"
Analysis: Step 6A - Check history: no assistant message mentions a magic wand. Never existed in game world.
Result: {"makesSense": false, "reasoning": "No magic wand was ever mentioned"}

Example 5 - Item state changed:
Context: Assistant says "You pick up a torch" → later player says "I throw the torch away" → Assistant confirms
User: "I light the torch"
Analysis: Step 6B - Torch existed (mentioned), was possessed (picked up), then lost (thrown away). Most recent state is LOSS.
Result: {"makesSense": false, "reasoning": "You no longer have the torch"}

Example 6 - Valid possession:
Context: Assistant describes "a sword on the table" → Player says "I take the sword" → Assistant confirms
User: "I swing the sword"
Analysis: Step 6B - Sword exists, was picked up, no loss event afterward. Current state is POSSESSED.
Result: {"makesSense": true, "reasoning": "You have the sword"}

Now analyze the latest USER message following these steps.`,
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
        temperature: 0,
        top_p: 0.9,
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
