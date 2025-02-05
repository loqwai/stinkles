#! /usr/bin/env bun
import { generateWorld, interact } from "./src/world";

const main = async () => {
  const seed = Math.floor(Math.random() * 1000000);
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
