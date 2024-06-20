import { describe, it, expect } from "bun:test";
import { ArgsParser } from "../src";
import type { CommandOption } from "seyfert";

const testOptions: Pick<CommandOption, "name">[] = [
	{
		name: "name",
	},
	{
		name: "flag",
	},
];

const parser = new ArgsParser();

describe("test", () => {
	it("should pass", () => {
		const content = "option1 --flag";
		const result = parser.runParser(content, testOptions as CommandOption[]);

		expect(result).toEqual({ name: "option1", flag: true });
	});
});
