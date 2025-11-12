#!/usr/bin/env bun

import { interact, getPrompt } from "../../src/world";
import type { State } from "../../src/world";

const testVerbosity = async (verbosity: "terse" | "normal" | "verbose") => {
  const initialState: State = {
    reply: "",
    messages: [],
    seed: 1,
    inventory: [],
    verbosity,
  };

  console.log(`\n=== Testing ${verbosity.toUpperCase()} ===`);
  console.log("Prompt being used:");
  console.log(getPrompt(verbosity).substring(0, 200) + "...\n");

  const state = await interact(initialState, "I open the ancient wooden door before me.");

  console.log(`Reply length: ${state.reply.length}`);
  console.log(`Display length: ${state.displayReply?.length ?? "not set"}`);
  console.log(`Reply: ${state.reply.substring(0, 150)}...`);
  console.log(`\nMessages count: ${state.messages.length}`);
  if (state.messages.length > 0) {
    console.log(`First message role: ${state.messages[0].role}`);
    console.log(`First message content preview: ${state.messages[0].content.substring(0, 150)}...`);
  }
};

(async () => {
  await testVerbosity("terse");
  await testVerbosity("normal");
  await testVerbosity("verbose");
})();
