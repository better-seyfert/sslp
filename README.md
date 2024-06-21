# SSLP (Super Seyfert Light Parser)
> Custom args parser for Seyfert.

SSLP is a lightweight and customizable argument parser designed specifically for use with [Seyfert](https://www.seyfert.dev/), enhancing command parsing capabilities with ease.

## Installation
You can install SSLP via npm, yarn, or pnpm:

```bash
npm install sslp
```

```bash
yarn add sslp
```

```bash
pnpm add sslp
```

## Usage
Integrating SSLP into your Seyfert client is straightforward:

```typescript
import { Client } from 'seyfert';
import { ArgsParser } from 'sslp';

const parser = new ArgsParser();
const seyfertClient = new Client({
    commands: {
        argsParser: (content, command) => parser.runParser(content, command)
    }
});
```

With SSLP configured, Seyfert can now leverage advanced argument parsing capabilities tailored to your application's needs.

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

