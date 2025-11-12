#!/usr/bin/env bun

import { interact } from "../../src/world";
import type { State } from "../../src/world";

const main = async () => {
  const initialState: State = {
    reply: "",
    messages: [
      {
        role: "system",
        content: "test",
      },
    ],
    seed: 1,
    inventory: [],
    verbosity: "normal",
  };

  console.log("Testing normal verbosity summarization...");
  const state = await interact(
    initialState,
    "I open the ancient wooden door before me."
  );

  console.log("\n=== REPLY (stored, should be verbose) ===");
  console.log(`Length: ${state.reply.length}`);
  console.log(state.reply);

  console.log("\n=== DISPLAY REPLY (shown to user, should be summarized) ===");
  console.log(`Length: ${state.displayReply?.length ?? "undefined"}`);
  console.log(state.displayReply ?? "NOT SET");

  console.log("\n=== VERBOSITY ===");
  console.log(state.verbosity);
};

main();
