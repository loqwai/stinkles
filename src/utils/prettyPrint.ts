import chalk from "chalk";

interface OllamaResponse {
  model: string;
  created_at: string;
  response?: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  eval_count?: number;
}

export function prettyPrintOllama(json: OllamaResponse): void {
  console.log("\n" + chalk.bold.blue("=== Ollama Response ==="));

  // Print model info
  console.log(chalk.cyan("Model:"), chalk.white(json.model));
  console.log(chalk.cyan("Created:"), chalk.white(json.created_at));

  // Print response if available
  if (json.response) {
    console.log("\n" + chalk.yellow("Response:"));
    console.log(chalk.white(json.response));
  }

  // Print timing information
  if (json.total_duration) {
    console.log("\n" + chalk.magenta("Timing Information:"));
    console.log(chalk.dim("├─"), chalk.magenta("Total Duration:"), chalk.white(`${(json.total_duration / 1e9).toFixed(2)}s`));

    if (json.load_duration) {
      console.log(chalk.dim("├─"), chalk.magenta("Load Duration:"), chalk.white(`${(json.load_duration / 1e9).toFixed(2)}s`));
    }

    if (json.prompt_eval_duration) {
      console.log(chalk.dim("├─"), chalk.magenta("Prompt Eval Duration:"), chalk.white(`${(json.prompt_eval_duration / 1e9).toFixed(2)}s`));
    }

    if (json.eval_duration) {
      console.log(chalk.dim("├─"), chalk.magenta("Eval Duration:"), chalk.white(`${(json.eval_duration / 1e9).toFixed(2)}s`));
    }

    if (json.eval_count) {
      console.log(chalk.dim("└─"), chalk.magenta("Eval Count:"), chalk.white(json.eval_count.toString()));
    }
  }

  // Print completion status
  console.log("\n" + chalk.cyan("Status:"), json.done ? chalk.green("Complete") : chalk.yellow("In Progress"));

  // Print context length if available
  if (json.context) {
    console.log(chalk.cyan("Context Length:"), chalk.white(json.context.length.toString()));
  }

  console.log(chalk.bold.blue("==================\n"));
}
