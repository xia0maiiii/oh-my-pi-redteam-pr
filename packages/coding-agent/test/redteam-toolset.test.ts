import { describe, expect, it } from "bun:test";
import {
	applyRedTeamToolsetSettings,
	getRedTeamWorkerToolNames,
	isRedTeamToolsetRun,
	REDTEAM_WORKER_DISABLED_SUBAGENTS,
	REDTEAM_WORKER_TARGET_TOOL_NAMES,
} from "@oh-my-pi/pi-coding-agent/redteam-toolset";

describe("red-team worker toolset", () => {
	it("activates only for text print runs", () => {
		expect(isRedTeamToolsetRun({ print: true })).toBe(true);
		expect(isRedTeamToolsetRun({ print: true, mode: "text" })).toBe(true);
		expect(isRedTeamToolsetRun({ print: true, mode: "json" })).toBe(false);
		expect(isRedTeamToolsetRun({ mode: "text" })).toBe(false);
	});

	it("keeps the Web/API worker tools in a stable order and includes the vulnerability recorder target", () => {
		expect(REDTEAM_WORKER_TARGET_TOOL_NAMES).toEqual([
			"read",
			"bash",
			"search",
			"find",
			"web_search",
			"browser",
			"eval",
			"write",
			"record_vulnerability",
		]);
		expect(REDTEAM_WORKER_TARGET_TOOL_NAMES).not.toContain("task");
		expect(REDTEAM_WORKER_TARGET_TOOL_NAMES).not.toContain("github");
	});

	it("filters unavailable tools so dependent recorder merges can land later", () => {
		expect(getRedTeamWorkerToolNames(["read", "bash", "record_vulnerability", "task"])).toEqual([
			"read",
			"bash",
			"record_vulnerability",
		]);
		expect(getRedTeamWorkerToolNames(["read", "bash", "task"])).toEqual(["read", "bash"]);
	});

	it("disables generic bundled subagents by default", () => {
		expect(REDTEAM_WORKER_DISABLED_SUBAGENTS).toEqual([
			"designer",
			"explore",
			"librarian",
			"oracle",
			"plan",
			"quick_task",
			"reviewer",
			"task",
		]);
	});

	it("applies settings that keep task delegation closed unless explicitly re-enabled", () => {
		const calls: Array<{ key: string; value: unknown }> = [];
		applyRedTeamToolsetSettings({
			override: (key, value) => {
				calls.push({ key, value });
			},
		});

		expect(calls).toEqual([
			{ key: "task.eager", value: false },
			{ key: "task.maxConcurrency", value: 1 },
			{ key: "task.maxRecursionDepth", value: 0 },
			{ key: "task.disabledAgents", value: [...REDTEAM_WORKER_DISABLED_SUBAGENTS] },
		]);
	});
});
