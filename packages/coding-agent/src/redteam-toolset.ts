import type { Args } from "./cli/args";
import type { Settings } from "./config/settings";

export const REDTEAM_WORKER_TARGET_TOOL_NAMES: readonly string[] = [
	"read",
	"bash",
	"search",
	"find",
	"web_search",
	"browser",
	"eval",
	"write",
	"record_vulnerability",
] as const;

export const REDTEAM_WORKER_DISABLED_SUBAGENTS: readonly string[] = [
	"designer",
	"explore",
	"librarian",
	"oracle",
	"plan",
	"quick_task",
	"reviewer",
	"task",
] as const;

export function isRedTeamToolsetRun(args: Pick<Args, "mode" | "print">): boolean {
	return args.print === true && (args.mode === undefined || args.mode === "text");
}

export function getRedTeamWorkerToolNames(availableToolNames: Iterable<string>): string[] {
	const available = new Set([...availableToolNames].map(name => name.toLowerCase()));
	return REDTEAM_WORKER_TARGET_TOOL_NAMES.filter(name => available.has(name));
}

export function applyRedTeamToolsetSettings(targetSettings: Pick<Settings, "override">): void {
	targetSettings.override("task.eager", false);
	targetSettings.override("task.maxConcurrency", 1);
	targetSettings.override("task.maxRecursionDepth", 0);
	targetSettings.override("task.disabledAgents", [...REDTEAM_WORKER_DISABLED_SUBAGENTS]);
}
