#!/usr/bin/env bun

import { generateWorld, interact, loadPromptFromFile } from "./src/world";
import { parseCommand } from "./src/commandParser";
import { saveState, loadState } from "./src/save";
import { parseArgs } from "util";
import { strict as assert } from "assert";
import { join } from "path";

const getArgs = (args: string[]) => {
  const {
    values: { seed, "prompt-file": promptFile, "auto-save": autoSave },
  } = parseArgs({
    args,
    options: {
      seed: {
        type: "string",
        default: Math.floor(Math.random() * 1000000).toString(),
      },
      "prompt-file": {
        type: "string",
        default: join(import.meta.dir, "prompts", "default.txt"),
      },
      "auto-save": {
        type: "boolean",
        default: false,
      },
    },
    allowPositionals: true,
  });

  return {
    seed: Number(seed),
    promptFile: promptFile as string,
    autoSave: autoSave as boolean,
  };
};

const main = async () => {
  const { seed, promptFile, autoSave } = getArgs(Bun.argv);

  assert(Number.isInteger(seed), "Seed must be an integer");

  // Load the base prompt from file
  const basePrompt = loadPromptFromFile(promptFile);

  console.log(`Seed: ${seed}`);
  console.log(`Prompt: ${promptFile}`);
  if (autoSave) {
    console.log(`Auto-save: enabled`);
  }

  // Try to load existing save if auto-save is enabled
  let state = autoSave ? loadState(promptFile, seed) : null;

  if (state) {
    console.log(`Loaded save from previous session`);
    console.log(state.displayReply ?? state.reply);
  } else {
    // Generate new world
    state = await generateWorld({ seed, basePrompt });
    console.log(state.displayReply ?? state.reply);

    // Save initial state if auto-save is enabled
    if (autoSave) {
      saveState(state, promptFile);
    }
  }

  console.log();
  process.stdout.write("> ");

  for await (const line of console) {
    // Check if input is a command
    const commandResult = parseCommand(state, line);

    if (commandResult.isCommand) {
      // Handle command
      if (commandResult.state) {
        state = commandResult.state;
      }
      if (commandResult.message) {
        console.log(commandResult.message);
      }
    } else {
      // Regular game interaction
      state = await interact(state, line);
      // Display the transformed reply, fallback to verbose if not set
      console.log(state.displayReply ?? state.reply);

      // Auto-save after each interaction
      if (autoSave) {
        saveState(state, promptFile);
      }
    }

    console.log();
    process.stdout.write("> ");
  }
};

main();
