import { describe, expect, it } from "bun:test";
import * as path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

async function readText(relativePath: string): Promise<string> {
	return await Bun.file(path.join(repoRoot, relativePath)).text();
}

describe("red-team worker docs and artifact contract", () => {
	it("documents the scheduler-facing omp -p contract and required artifacts", async () => {
		const doc = await readText("docs/redteam-worker.md");

		expect(doc).toContain('omp -p "<authorized task>"');
		expect(doc).toContain("REPORT.md");
		expect(doc).toContain("redteam-findings/findings.jsonl");
		expect(doc).toContain("01_request.http");
		expect(doc).toContain("01_response.http");
		expect(doc).toContain("record_vulnerability");
		expect(doc).toContain("modelRoles.plan");
		expect(doc).toContain("modelRoles.execute");
		expect(doc).toContain("modelRoles.report");
	});

	it("ships a mock HTTP smoke task with an explicit local-only target", async () => {
		const task = await readText("packages/coding-agent/examples/redteam-worker/mock-http-task.md");
		const server = await readText("packages/coding-agent/examples/redteam-worker/mock-http-server.ts");

		expect(task).toContain("http://127.0.0.1:18080");
		expect(task).toContain("Authorization: Bearer lowpriv-demo");
		expect(task).toContain("omp -p");
		expect(server).toContain("Bun.serve");
		expect(server).toContain("api\\/orders");
	});

	it("keeps the sample findings JSONL linked to separated Burp raw packets", async () => {
		const fixtureRoot = "packages/coding-agent/test/fixtures/redteam-worker";
		const jsonl = await readText(`${fixtureRoot}/redteam-findings/findings.jsonl`);
		const records = jsonl
			.split("\n")
			.filter(Boolean)
			.map(
				line =>
					JSON.parse(line) as {
						name?: string;
						impact?: string;
						evidence?: { request_raw_path?: string; response_raw_path?: string };
					},
			);

		expect(records).toHaveLength(1);
		const record = records[0]!;
		expect(record.name).toBe("IDOR exposes another user's order");
		expect(record.impact).toContain("low-privileged user");
		expect(record.evidence?.request_raw_path).toBe("redteam-findings/burp/idor-demo-1/01_request.http");
		expect(record.evidence?.response_raw_path).toBe("redteam-findings/burp/idor-demo-1/01_response.http");

		const request = await readText(`${fixtureRoot}/${record.evidence!.request_raw_path}`);
		const response = await readText(`${fixtureRoot}/${record.evidence!.response_raw_path}`);
		expect(request.startsWith("GET /api/orders/1002 HTTP/1.1\n")).toBe(true);
		expect(response.startsWith("HTTP/1.1 200 OK\n")).toBe(true);
	});
});
