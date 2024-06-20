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
```ts
import { Client } from "seyfert";
import { ArgsParser } from "sslp";

const parser = new ArgsParser();
const seyfertClient = new Client({
    commands: {
        argsParser: (content, command) => parser.runParser(content, command.options)
    }
});

// That's it! Now you can use Seyfert with your new upgraded args parser!
```

## Contributing
I appreciate contributions a lot, you are welcome to do so! 🥰