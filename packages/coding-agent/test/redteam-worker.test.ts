import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import {
	applyRedTeamWorkerSettings,
	buildRedTeamWorkerSystemPrompt,
	getRedTeamWorkerReportPath,
	isRedTeamWorkerRun,
	REDTEAM_WORKER_REPORT_NAME,
	writeRedTeamWorkerReport,
} from "@oh-my-pi/pi-coding-agent/redteam-worker";

describe("red-team worker defaults", () => {
	let tmpDir: string;

	beforeEach(async () => {
		tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "redteam-worker-test-"));
	});

	afterEach(async () => {
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	it("activates only for text print runs", () => {
		expect(isRedTeamWorkerRun({ print: true })).toBe(true);
		expect(isRedTeamWorkerRun({ print: true, mode: "text" })).toBe(true);
		expect(isRedTeamWorkerRun({ print: true, mode: "json" })).toBe(false);
		expect(isRedTeamWorkerRun({ mode: "text" })).toBe(false);
	});

	it("overrides task settings to prevent recursive subagent work", () => {
		const calls: Array<{ key: string; value: unknown }> = [];
		applyRedTeamWorkerSettings({
			override: (key, value) => {
				calls.push({ key, value });
			},
		});

		expect(calls).toEqual([
			{ key: "todo.eager", value: false },
			{ key: "task.eager", value: false },
			{ key: "task.maxConcurrency", value: 1 },
			{ key: "task.maxRecursionDepth", value: 0 },
		]);
	});

	it("renders the worker system prompt from the static prompt file", () => {
		const rendered = buildRedTeamWorkerSystemPrompt();

		expect(rendered).toContain("single Web/API penetration testing");
		expect(rendered).toContain("Do not delegate to generic task subagents");
		expect(rendered).toContain("record_vulnerability");
		expect(rendered).toContain("Markdown only");
	});

	it("writes REPORT.md as Markdown with a trailing newline", async () => {
		const reportPath = getRedTeamWorkerReportPath(tmpDir);
		await writeRedTeamWorkerReport(reportPath, "# Report\n\nConfirmed finding.");

		expect(path.basename(reportPath)).toBe(REDTEAM_WORKER_REPORT_NAME);
		expect(await Bun.file(reportPath).text()).toBe("# Report\n\nConfirmed finding.\n");
	});
});
