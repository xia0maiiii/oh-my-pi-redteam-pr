import * as path from "node:path";
import * as prompt from "@oh-my-pi/pi-utils/prompt";
import type { Args } from "./cli/args";
import type { Settings } from "./config/settings";
import redTeamWorkerSystemPrompt from "./prompts/system/redteam-worker.md" with { type: "text" };

export const REDTEAM_WORKER_REPORT_NAME = "REPORT.md";

export const REDTEAM_WORKER_TOOL_NAMES: readonly string[] = [
	"read",
	"bash",
	"search",
	"find",
	"web_search",
	"browser",
	"eval",
	"write",
] as const;

export function isRedTeamWorkerRun(args: Pick<Args, "mode" | "print">): boolean {
	return args.print === true && (args.mode === undefined || args.mode === "text");
}

export function buildRedTeamWorkerSystemPrompt(): string {
	return prompt.render(redTeamWorkerSystemPrompt);
}

export function applyRedTeamWorkerSettings(targetSettings: Pick<Settings, "override">): void {
	targetSettings.override("todo.eager", false);
	targetSettings.override("task.eager", false);
	targetSettings.override("task.simple", "independent");
	targetSettings.override("task.maxConcurrency", 1);
	targetSettings.override("task.maxRecursionDepth", 0);
}

export function getRedTeamWorkerReportPath(cwd: string): string {
	return path.join(cwd, REDTEAM_WORKER_REPORT_NAME);
}

export async function writeRedTeamWorkerReport(reportPath: string, markdown: string): Promise<void> {
	const report = markdown.endsWith("\n") ? markdown : `${markdown}\n`;
	await Bun.write(reportPath, report);
}
