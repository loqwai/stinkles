import { strict as assert } from "assert";
import type { Verbosity } from "./world";

/**
 * Summarizes a verbose response to match the desired verbosity level
 * @param verboseText The full verbose response to summarize
 * @param targetVerbosity The desired verbosity level (terse or normal)
 * @param seed Random seed for deterministic AI responses
 * @returns Summarized text at the target verbosity level
 */
export const summarizeResponse = async (
  verboseText: string,
  targetVerbosity: "terse" | "normal",
  seed: number
): Promise<string> => {
  const systemPrompts = {
    terse: `You are a text summarizer. Rewrite the following game master response to be extremely brief and direct.
Use one short sentence maximum (10-15 words total). Remove ALL purple prose, flowery language, and dramatic descriptions.
Keep ONLY the essential action/information. Be maximally concise and to-the-point.

Output ONLY the rewritten text, nothing else.`,
    normal: `You are a text summarizer. Rewrite the following game master response to be moderately dramatic but concise.
Use 2-3 sentences maximum (under 300 characters total). Keep SOME purple prose but dramatically reduce the elaboration.
Maintain the key information and atmosphere but be significantly more concise than the original.

Output ONLY the rewritten text, nothing else.`,
  };

  const messages = [
    {
      role: "system",
      content: systemPrompts[targetVerbosity],
    },
    {
      role: "user",
      content: verboseText,
    },
  ];

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:latest",
      messages,
      stream: false,
      options: { seed, temperature: 0.5 },
    }),
  });

  assert(response.ok, "Failed to summarize: " + response.statusText);

  const json = await response.json();
  return json.message.content;
};
