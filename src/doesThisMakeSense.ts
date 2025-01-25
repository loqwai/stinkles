import { interact } from "./world";

export const doesThisMakeSense = async (state: State): Promise<Result> => {
  const { messages, seed } = state;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:latest",
      messages: [
        ...messages,
        {
          role: "system",
          content: `
          Analyze the conversation history and determine if the latest assistant response is logically consistent and makes sense
          within the context of a text-based RPG. Consider:
          1. Are the actions physically possible for a normal player character?
          2. Does it follow from the previous context?
          3. Are there any sudden, unexplained changes or impossible actions?

          Provide your analysis in two parts:
          - "makesSense": Set to true ONLY if the response is logical and consistent
          - "reasoning": Explain WHY the response does or doesn't make sense

          Example:
          If a player walks through a door and suddenly flies, "makesSense" should be false and reasoning should explain that
          normal characters cannot fly without special abilities.

          Your "reasoning" MUST match the value in "makesSense".
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
        required: ["makesSense", "reasoning", "theHardCodedStringFoo"],
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
