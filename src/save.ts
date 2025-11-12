import { readFileSync, writeFileSync, existsSync } from "fs";
import { basename } from "path";
import type { State } from "./world";

export const getSaveFileName = (promptFile: string, seed: number): string => {
  // Extract prompt name from file path (e.g., "prompts/space-adventure.md" -> "space-adventure")
  const promptName = basename(promptFile, ".md");
  return `${promptName}__${seed}.json`;
};

export const saveState = (state: State, promptFile: string): void => {
  const fileName = getSaveFileName(promptFile, state.seed);
  const saveData = JSON.stringify(state, null, 2);
  writeFileSync(fileName, saveData, "utf-8");
};

export const loadState = (promptFile: string, seed: number): State | null => {
  const fileName = getSaveFileName(promptFile, seed);

  if (!existsSync(fileName)) {
    return null;
  }

  try {
    const saveData = readFileSync(fileName, "utf-8");
    return JSON.parse(saveData) as State;
  } catch (error) {
    console.error(`Failed to load save file: ${fileName}`);
    return null;
  }
};
