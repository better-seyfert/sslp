import { describe, expect, it } from "bun:test";
import type { Command, CommandOption } from "seyfert";
import { ArgsParser } from "../src";

const testOptions: Pick<CommandOption, "name">[] = [
	{
		name: "name",
	},
	{
		name: "age",
	},
	{
		name: "flag1",
	},
];

const parser = new ArgsParser();

describe("test", () => {
	it("should pass", () => {
		const content = "option1 --age=10 --flag";
		const result = parser.runParser(content, {
			options: testOptions,
		} as Command);

		expect(result).toEqual({ name: "option1", age: "10", flag: true });
	});
});
