# SSLP (super seyfert light parser) 
> Custom args parser for Seyfert.


## Installation
```bash
bun add sslp
```
or pnpm...
```bash
pnpm add sslp
```

## Usage
Integrating SSLP into your Seyfert client is straightforward:

```ts
import { Client } from "seyfert";
import { ArgsParser } from "sslp" 

const parser = new ArgsParser();
const seyfertClient = new Client({
    commands: {
        argsParser: (content, command) => parser.runParser(content, command)
    }
});

// That's it! Now you can use Seyfert with your new upgraded args parser!
```

## Features

### Custom Configuration
SSLP allows you to configure various aspects of argument parsing, including:
- **Prefixes**: Define custom prefixes for options and flags.
- **Separators**: Specify separators between option names and values.
- **Quotes**: Support for different quote styles to encapsulate values.

### Quote Patterns
Quote patterns enable you to define complex quote styles using regular expressions or simple strings. These patterns need to be activated for use:

```typescript
import { ArgsParser, ParserConfig } from 'sslp';

// Define quote patterns using regular expressions
const customQuotePatterns = [
    [/```(ts|js)/, "```"],  // Matches ```ts and ```js
    ["```", "```"],         // Matches simple ``` quotes
];

// Apply quote patterns to a command class
@ParserConfig({ quotes: customQuotePatterns })
class MyCommand extends Command {
    // Command implementation
}
```

### Decorator Support
Use the `@ParserConfig` decorator to set parser configuration directly on command classes:

```typescript
import { ParserConfig } from 'sslp';

@ParserConfig({ prefixes: ['--'], separators: ['='] })
class MyCommand extends Command {
    // Command implementation
}
```

