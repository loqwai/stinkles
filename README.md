# stinkles
text adventure game powered by ollama

## Usage

Run with default fantasy prompt:
```bash
./index.ts --seed 42
```

Run with custom prompt (specify as first argument):
```bash
./index.ts prompts/epic-fantasy.md --seed 42
```

Run with auto-save/load:
```bash
./index.ts prompts/space-adventure.md --seed 42 --auto-save
```

Auto-save creates save files named `<prompt_name>__<seed>.json` and automatically loads them on restart.

## Features

- **Customizable Prompts**: Create your own game master prompts in the `prompts/` directory
- **Auto-Save/Load**: Use `--auto-save` to automatically save progress after every step
- **Verbosity Control**: Use `/verbosity terse|normal|verbose` to adjust response length
- **Deterministic**: Use `--seed` to get reproducible game sessions
- **Validation System**: AI validates player actions for physical possibility

## Custom Prompts

Create a markdown file in `prompts/` with your game master instructions. Examples:
- `prompts/default.md` - Fantasy RPG dungeon crawler
- `prompts/epic-fantasy.md` - Epic fantasy with dragons, ancient magic, and legendary quests
- `prompts/space-adventure.md` - Sci-fi space exploration

The prompt file contains the base instructions for the game master. Verbosity modifiers are automatically applied on top.

Prompts can include atmosphere keywords that guide the LLM's creative descriptions while maintaining consistency.
