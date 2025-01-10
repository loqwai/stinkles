import { strict as assert } from "assert";

export const generateWorld = async ({ seed }: { seed: number }) => {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      prompt:
        "Generate a brief description of a world. Keep it to one sentence",
      stream: false,
      options: {
        seed,
      },
    }),
  });

  assert(response.ok, "Failed to generate world: " + response.statusText);

  const json = await response.json();

  return json.response;
};
