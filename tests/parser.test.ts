import { describe, expect, it } from "bun:test";
import type { Command, CommandOption } from "seyfert";
import { ArgsParser } from "../src";

const testOptions: Pick<CommandOption, "name">[] = [
	{
		name: "name",
	},
	{
		name: "flag1",
	},
	{
		name: "flag2",
	},
];

const parser = new ArgsParser();

describe("test", () => {
	it("should pass", () => {
		const content = "option1 --flag1 --flag2=value";
		const result = parser.runParser(content, {
			options: testOptions,
		} as Command);

		expect(result).toEqual({ name: "option1", flag1: true, flag2: "value" });
	});
});
