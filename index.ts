#! /usr/bin/env bun

import { generateWorld, interact } from "./src/world";
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
  console.log(state.reply);
  console.log();
  process.stdout.write("> ");

  for await (const line of console) {
    state = await interact({
      ...state,
      question: line,
    });
    console.log(state.reply);
    console.log();
    process.stdout.write("> ");
  }
};

main();
