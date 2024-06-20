import {
	Lexer,
	Parser,
	type ParserResult,
	PrefixedStrategy,
} from "@sapphire/lexure";
import type { CommandOption } from "seyfert";

interface ArgsParserOptions {
	prefixes?: string[];
	separators?: string[];
	quotes?: [string, string][];
}

export class ArgsParser {
	private parser: Parser;
	private lexer: Lexer;

	constructor(options?: ArgsParserOptions) {
		const defaultPrefixes = ["--", "/"];
		const defaultSeparators = ["=", ":"];
		const defaultQuotes: [string, string][] = [
			['"', '"'],
			["“", "”"],
			["「", "」"],
		];

		const prefixes = options?.prefixes ?? defaultPrefixes;
		const separators = options?.separators ?? defaultSeparators;
		const quotes = options?.quotes ?? defaultQuotes;

		this.parser = new Parser(new PrefixedStrategy(prefixes, separators));
		this.lexer = new Lexer({ quotes });
	}

	parseContent(content: string): ParserResult {
		return this.parser.run(this.lexer.run(content));
	}

	getOptionValues(parsedContent: ParserResult, optionName: string) {
		return parsedContent.options.get(optionName) ?? [];
	}

	getOrderedValues(
		parsedContent: ParserResult,
		commandOptions: CommandOption[],
	) {
		return commandOptions.map(
			(_, index) => parsedContent.ordered[index]?.value ?? null,
		);
	}

	extractOptions(
		parsedContent: ParserResult,
		commandOptions: CommandOption[],
	): Record<string, string | boolean> {
		const optionsMap: Record<string, string | boolean> = {};

		// Process named and ordered options
		for (const { name } of commandOptions) {
			const optionValues = this.getOptionValues(parsedContent, name);
			if (optionValues.length > 0) {
				optionsMap[name] = optionValues[0];
			} else {
				const orderedValues = this.getOrderedValues(
					parsedContent,
					commandOptions,
				);
				for (let i = 0; i < orderedValues.length; i++) {
					if (orderedValues[i] !== null) {
						optionsMap[commandOptions[i].name] = orderedValues[i] as string;
					}
				}
			}
		}

		// Process flag options using the flags set
		for (const flag of parsedContent.flags.values()) {
			optionsMap[flag] = true;
		}

		return optionsMap;
	}

	runParser(content: string, commandOptions: CommandOption[]) {
		const parsedContent = this.parseContent(content);
		return this.extractOptions(parsedContent, commandOptions);
	}
}
