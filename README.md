# stinkles
text adventure game powered by ollama

## Usage

Run with default fantasy prompt:
```bash
./index.ts --seed 42
```

Run with custom prompt:
```bash
./index.ts --seed 42 --prompt-file prompts/space-adventure.txt
```

## Features

- **Customizable Prompts**: Create your own game master prompts in the `prompts/` directory
- **Verbosity Control**: Use `/verbosity terse|normal|verbose` to adjust response length
- **Deterministic**: Use `--seed` to get reproducible game sessions
- **Validation System**: AI validates player actions for physical possibility

## Custom Prompts

Create a text file in `prompts/` with your game master instructions. Examples:
- `prompts/default.txt` - Fantasy RPG dungeon crawler
- `prompts/space-adventure.txt` - Sci-fi space exploration

The prompt file contains the base instructions for the game master. Verbosity modifiers are automatically applied on top.
