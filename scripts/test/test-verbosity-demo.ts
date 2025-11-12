#!/usr/bin/env bun

/**
 * Demo script to showcase the verbosity feature
 * Run with: bun run scripts/test/test-verbosity-demo.ts
 */

import { generateWorld, interact } from "../../src/world";
import chalk from "chalk";

const main = async () => {
  console.log(chalk.bold.cyan("\n=== Verbosity Feature Demo ===\n"));

  const seed = 42;
  const userAction = "I open the ancient wooden door and step inside.";

  console.log(chalk.yellow(`Seed: ${seed}`));
  console.log(chalk.yellow(`Action: "${userAction}"\n`));

  // Test TERSE verbosity
  console.log(chalk.bold.red("📝 TERSE MODE (displayed to user):"));
  console.log(chalk.dim("(Brief, direct, minimal prose)\n"));
  const terseWorld = await generateWorld({ seed, verbosity: "terse" });
  const terseState = await interact(terseWorld, userAction);
  const terseDisplay = terseState.displayReply ?? terseState.reply;
  console.log(chalk.red(terseDisplay));
  console.log(chalk.dim(`Display length: ${terseDisplay.length} chars`));
  console.log(chalk.dim(`Stored length: ${terseState.reply.length} chars\n`));

  // Test NORMAL verbosity
  console.log(chalk.bold.blue("📖 NORMAL MODE (displayed to user):"));
  console.log(chalk.dim("(Moderate drama with some flair)\n"));
  const normalWorld = await generateWorld({ seed, verbosity: "normal" });
  const normalState = await interact(normalWorld, userAction);
  const normalDisplay = normalState.displayReply ?? normalState.reply;
  console.log(chalk.blue(normalDisplay));
  console.log(chalk.dim(`Display length: ${normalDisplay.length} chars`));
  console.log(chalk.dim(`Stored length: ${normalState.reply.length} chars\n`));

  // Test VERBOSE verbosity
  console.log(chalk.bold.magenta("🎭 VERBOSE MODE (displayed to user):"));
  console.log(chalk.dim("(Maximum purple prose and drama)\n"));
  const verboseWorld = await generateWorld({ seed, verbosity: "verbose" });
  const verboseState = await interact(verboseWorld, userAction);
  const verboseDisplay = verboseState.displayReply ?? verboseState.reply;
  console.log(chalk.magenta(verboseDisplay));
  console.log(chalk.dim(`Display length: ${verboseDisplay.length} chars`));
  console.log(chalk.dim(`Stored length: ${verboseState.reply.length} chars\n`));

  // Summary
  console.log(chalk.bold.green("\n=== Summary ==="));
  console.log(chalk.bold("Display lengths (what user sees):"));
  console.log(
    chalk.green(
      `Terse: ${terseState.displayReply?.length ?? terseState.reply.length} chars < Normal: ${normalState.displayReply?.length ?? normalState.reply.length} chars < Verbose: ${verboseState.displayReply?.length ?? verboseState.reply.length} chars`
    )
  );
  console.log(chalk.bold("\nStored lengths (conversation history):"));
  console.log(
    chalk.green(
      `Terse: ${terseState.reply.length} chars, Normal: ${normalState.reply.length} chars, Verbose: ${verboseState.reply.length} chars`
    )
  );
  console.log(
    chalk.cyan(
      `\n✨ All responses are generated and stored as VERBOSE for consistency!`
    )
  );
  console.log(
    chalk.cyan(
      `📊 Display is then transformed based on user's verbosity preference.`
    )
  );
  console.log(
    chalk.green(
      `\n✓ Use /verbosity [terse|normal|verbose] in-game to change display style.\n`
    )
  );
};

main();
