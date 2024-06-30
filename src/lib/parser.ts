import {
	Lexer,
	Parser,
	type ParserResult,
	PrefixedStrategy,
} from "@sapphire/lexure";
import {
	type CommandOption,
	Logger,
	type Command as SeyfertCommand,
	type SubCommand,
} from "seyfert";

interface ArgsParserOptions {
	prefixes?: string[];
	separators?: string[];
	quotes?: (string | RegExp)[][];

	debug?: boolean;
	buildPatterns?: boolean;
}

type Command = (SeyfertCommand | SubCommand) & {
	__parserConfig?: ArgsParserOptions;
};

/**
 * Generates the default configuration for the ArgsParser.
 *
 * @param [options] - The options to override the defaults.
 * @param [command] - The command object that may contain its own parser configuration.
 * @returns The combined configuration.
 */
export const defaultConfig = (options?: ArgsParserOptions) => {
	const _options = options ?? {};
	return {
		prefixes: _options.prefixes ?? ["--", "/"],
		separators: _options.separators ?? ["=", ":"],
		quotes: _options.quotes ?? [
			['"', '"'],
			["“", "”"],
			["「", "」"],
		],
		debug: _options.debug ?? false,
		buildPatterns: _options.buildPatterns ?? true,
	};
};

export class ArgsParser {
	private parser!: Parser;
	private lexer!: Lexer;
	private debug: Logger | false = false;

	/**
	 * Creates an instance of ArgsParser.
	 *
	 * @param [options] - The initial configuration options.
	 */
	constructor(options?: ArgsParserOptions) {
		this.configureParser(options);
	}

	/**
	 * Configures the parser and lexer with the provided options.
	 *
	 * @param [options] - The configuration options.
	 */
	private configureParser(options?: ArgsParserOptions) {
		const { prefixes, separators, quotes, debug, buildPatterns } =
			defaultConfig(options);
		this.debug = debug ? new Logger({ name: "ArgsParser" }) : false;
		this.parser = new Parser(new PrefixedStrategy(prefixes, separators));
		this.lexer = new Lexer({
			quotes: buildPatterns
				? this.buildQuotePatterns(quotes)
				: (quotes as [string, string][]),
		});
	}

	private buildQuotePatterns(quotes: (string | RegExp)[][]) {
		const transformedPatterns: [string, string][] = [];

		for (const pattern of quotes) {
			if (typeof pattern[0] === "string" && typeof pattern[1] === "string") {
				transformedPatterns.push([pattern[0], pattern[1]]);
			} else if (
				pattern[0] instanceof RegExp &&
				typeof pattern[1] === "string"
			) {
				const regex = pattern[0];
				const replacement = pattern[1];

				// Extract all options from the regex
				const options = regex.source.match(/\((.*?)\)/)?.[1]?.split("|") ?? [];
				for (const option of options) {
					const formattedPattern = regex.source.replace(/\(.*?\)/, option);
					transformedPatterns.push([formattedPattern, replacement]);
				}
			} else {
				throw new Error(`Invalid quote pattern: ${pattern}`);
			}
		}

		return transformedPatterns;
	}

	/**
	 * Parses the input content using the lexer and parser.
	 *
	 * @param content - The content to be parsed.
	 * @returns The result of the parsing process.
	 *
	 * @example
	 * ```typescript
	 * const parser = new ArgsParser();
	 * const result = parser.parseContent('--option=value');
	 * console.log(result);
	 * ```
	 */
	parseContent(content: string): ParserResult {
		return this.parser.run(this.lexer.run(content));
	}

	private extractOption(parsedContent: ParserResult, optionName: string) {
		return parsedContent.options.get(optionName) ?? [];
	}

	private extractOrdered(parsedContent: ParserResult, index: number) {
		return parsedContent.ordered[index]?.value ?? null;
	}

	/**
	 * Parses the input content using the lexer and parser.
	 *
	 * @param content - The content to be parsed.
	 * @returns The result of the parsing process.
	 *
	 * @example
	 * ```typescript
	 * const parser = new ArgsParser();
	 * const result = parser.parseContent('--flag=value');
	 * console.log(result);
	 * ```
	 */
	extractOptions(
		parsedContent: ParserResult,
		commandOptions: CommandOption[],
	): Record<string, string | boolean> {
		const optionsMap: Record<string, string | boolean> = {};

		for (let i = 0; i < commandOptions.length; i++) {
			const { name } = commandOptions[i];
			const optionValues = this.extractOption(parsedContent, name);
			if (optionValues.length > 0) {
				optionsMap[name] = optionValues[0];
			} else {
				const orderedValue = this.extractOrdered(parsedContent, i);
				if (orderedValue !== null) {
					optionsMap[name] = orderedValue as string;
				}
			}
		}

		for (const flag of parsedContent.flags.values()) {
			optionsMap[flag] = true;
		}

		if (this.debug) {
			for (const [name, value] of Object.entries(optionsMap)) {
				this.debug.debug(`Extracted option '${name}' with value '${value}'`);
			}
		}

		return optionsMap;
	}

	/**
	 * Runs the parser on the given content using the provided command's configuration.
	 *
	 * @param content - The content to parse.
	 * @param command - The command to use for configuration.
	 * @returns The extracted options and flags.
	 *
	 * @example
	 * ```typescript
	 * const parser = new ArgsParser();
	 * const command = { options: [{ name: 'flag' }, { name: 'option' }] };
	 * const result = parser.runParser('--flag --option=value', command);
	 * console.log(result);
	 * ```
	 */
	runParser(content: string, command: SeyfertCommand | SubCommand) {
		const config = (command as Command).__parserConfig;
		if (config) this.configureParser(config);

		const parsedContent = this.parseContent(content);
		return this.extractOptions(
			parsedContent,
			command.options as CommandOption[],
		);
	}
}

/**
 * Decorator to set parser configuration for a command class.
 *
 * @param config - The configuration options.
 *
 * @example
 * ```typescript
 * @ParserConfig({ prefixes: ['--'], separators: ['='] })
 * class MyCommand  extends Command {}
 * ```
 */
export function ParserConfig(config: ArgsParserOptions) {
	// biome-ignore lint/complexity/noBannedTypes: xd
	// biome-ignore lint/suspicious/noExplicitAny: xd
	return <T extends { new (...args: any[]): {} }>(target: T) => {
		return class extends target {
			__parserConfig = defaultConfig(config);
		};
	};
}
