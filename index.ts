#! /usr/bin/env bun
import { generateWorld } from "./src/world";

const main = async () => {
  let input = "";
  process.stdin.on("data", (chunk) => {
    input += chunk;
  });

  let stdinData = "";
  for await (const chunk of process.stdin) {
    stdinData += chunk;
  }

  const parsedInput = JSON.parse(stdinData);
  console.log(JSON.stringify(parsedInput, null, 2));

  const world = await generateWorld({ seed: 1 });
  console.log(JSON.stringify(world, null, 2));
};

main();
