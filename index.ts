#! /usr/bin/env bun

import { generateWorld, interact } from "./src/world";
import { parseCommand } from "./src/commandParser";
import { parseArgs } from "util";
import { strict as assert } from "assert";

const getArgs = (args: string[]) => {
  const {
    values: { seed },
  } = parseArgs({
    args,
    options: {
      seed: {
        type: "string",
        default: Math.floor(Math.random() * 1000000).toString(),
      },
    },
    allowPositionals: true,
  });

  return {
    seed: Number(seed),
  };
};

const main = async () => {
  const { seed } = getArgs(Bun.argv);

  assert(Number.isInteger(seed), "Seed must be an integer");

  console.log(`Seed: ${seed}`);
  let state = await generateWorld({ seed });
  console.log(state.displayReply ?? state.reply);
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
    }

    console.log();
    process.stdout.write("> ");
  }
};

main();
