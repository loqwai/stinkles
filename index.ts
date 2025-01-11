#! /usr/bin/env bun
import { generateWorld, interact } from "./src/world";

const main = async () => {
  let state = await generateWorld({ seed: 1 });
  console.log(state.reply);

  for await (const line of console) {
    state = await interact({
      ...state,
      question: line,
    });
    console.log(state.reply);
  }
};

main();
