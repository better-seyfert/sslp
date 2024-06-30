import { bench, group, run } from "mitata";
import type { Command } from "seyfert";
import { YunaParser } from "yunaforseyfert";
import { ArgsParser } from "../src";
import { ApplicationCommandOptionType } from "seyfert/lib/types";

import { parseArgs } from "node:util";

const {
	values: { json },
} = parseArgs({
	args: Bun.argv,
	options: {
		json: {
			type: "boolean",
			default: false,
		},
	},
	strict: true,
	allowPositionals: true,
});

const yuna = YunaParser();
const sslp = new ArgsParser();

const commandOptions = {
	options: [
		{
			name: "name",
			type: ApplicationCommandOptionType.String,
		},
	],
} as Command;

const content = "!hello --name=world";

group("Simple parsing", () => {
	bench("Yuna", () => {
		yuna(content, commandOptions);
	});
	bench("SSLP", () => {
		sslp.runParser(content, commandOptions);
	});
});

if (json)
	run({
		json: true,
		silent: true,
	}).then((o) =>
		Bun.write(
			"./bench.json",
			Buffer.from(JSON.stringify(o.benchmarks), "utf-8"),
		),
	);

await run({
	silent: false, // enable/disable stdout output
	avg: true, // enable/disable avg column (default: true)
	json: false, // enable/disable json output (default: false)
	colors: true, // enable/disable colors (default: true)
	min_max: true, // enable/disable min/max column (default: true)
	percentiles: false, // enable/disable percentiles column (default: true)
});
