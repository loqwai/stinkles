import type { State, Verbosity } from "./world";

export interface CommandResult {
  isCommand: boolean;
  state?: State;
  message?: string;
}

export const parseCommand = (
  state: State,
  input: string
): CommandResult => {
  const trimmedInput = input.trim();

  // Check if input starts with /
  if (!trimmedInput.startsWith("/")) {
    return { isCommand: false };
  }

  // Parse the command
  const parts = trimmedInput.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "verbosity": {
      if (args.length === 0) {
        return {
          isCommand: true,
          state,
          message: `Current verbosity: ${state.verbosity ?? "normal"}. Usage: /verbosity [terse|normal|verbose]`,
        };
      }

      const level = args[0].toLowerCase();
      if (level !== "terse" && level !== "normal" && level !== "verbose") {
        return {
          isCommand: true,
          state,
          message: `Invalid verbosity level: ${level}. Choose: terse, normal, or verbose.`,
        };
      }

      return {
        isCommand: true,
        state: { ...state, verbosity: level as Verbosity },
        message: `Verbosity set to ${level}.`,
      };
    }

    default:
      return {
        isCommand: true,
        state,
        message: `Unknown command: ${command}`,
      };
  }
};
