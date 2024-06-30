import { bench, group, run } from "mitata";
import type { Command } from "seyfert";
import { YunaParser } from "yunaforseyfert";
import { ArgsParser } from "../src";

group("Simple parsing", () => {
	bench("Yuna", () => {
		const parser = YunaParser();

		parser("simxnet unallowed", { options: [{ name: "name" }] } as Command);
	});
	bench("SSLP", () => {
		const parser = new ArgsParser();

		parser.runParser("simxnet unallowed", {
			options: [{ name: "name" }],
		} as Command);
	});
});

run({
	json: true,
	silent: true,
}).then((o) =>
	Bun.write("./bench.json", Buffer.from(JSON.stringify(o.benchmarks), "utf-8")),
);

await run({
	silent: false, // enable/disable stdout output
	avg: true, // enable/disable avg column (default: true)
	json: false, // enable/disable json output (default: false)
	colors: true, // enable/disable colors (default: true)
	min_max: true, // enable/disable min/max column (default: true)
	percentiles: false, // enable/disable percentiles column (default: true)
});
