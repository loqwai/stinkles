import { interact } from "./world";

export const doesThisMakeSense = async (state: State): Promise<Result> => {
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
          content: `
            Evaluate whether the story so far makes sense and put that result in makesSense. The assistant is
            allowed to world build, the user is not. Put your reason why you felt that way in reasoning. Respond
            using the JSON schema
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
        temperature: 0.0,
      },
    }),
  });

  const res = await response.json();
  return JSON.parse(res.message.content);
};

type State = Pick<Awaited<ReturnType<typeof interact>>, "messages" | "seed">;
interface Result {
  makesSense: boolean;
  reasoning: string;
}
