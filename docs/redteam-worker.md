# OMP Red-Team Worker

This document describes the Web/API red-team worker profile used when OMP is launched by a scheduler with `omp -p "<authorized task>"`.

## Runtime Contract

- `omp -p` runs as a single worker agent for authorized Web/API penetration testing.
- The final stdout payload is Markdown and is also written to `REPORT.md` in the run working directory.
- The run should stop at a confirmed high-impact vulnerability when that is the objective, but it must preserve every confirmed lower-severity finding discovered on the way.
- The worker must stay low-noise by default: no credential spraying, destructive actions, persistence, lateral movement, denial-of-service, or broad scanning unless the task explicitly authorizes it.

## Model Roles

Configure model roles instead of adding a new provider:

```yaml
modelRoles:
  plan: openai/gpt-5.2-codex
  execute: deepseek/deepseek-chat
  report: openai/gpt-5.2-codex
```

The intended routing is:

- `modelRoles.plan`: planning, risk tradeoffs, and next-step selection.
- `modelRoles.execute`: tool-heavy execution and request crafting.
- `modelRoles.report`: final Markdown report synthesis.

## Default Tools

The red-team worker baseline is:

```text
read,bash,search,find,web_search,browser,eval,write,record_vulnerability
```

Generic task delegation, reviewer/designer subagents, and unrelated repository-management abilities are disabled by default. If a run needs an extra tool, pass an explicit `--tools` list for that run.

## Vulnerability Recorder

Call `record_vulnerability` for each confirmed finding. The required fields are:

- `name`: vulnerability name.
- `impact`: concrete security impact.
- `request_raw`: Burp-compatible raw HTTP request.
- `response_raw`: Burp-compatible raw HTTP response.

The recorder writes:

```text
redteam-findings/
  findings.jsonl
  burp/
    <finding_id>/
      01_request.http
      01_response.http
REPORT.md
```

Each JSONL record must keep `name`, `impact`, and paths to the separated Burp raw request/response files.

## Mock HTTP Smoke

Start the local vulnerable mock service:

```bash
bun packages/coding-agent/examples/redteam-worker/mock-http-server.ts
```

Then run the worker from another shell:

```bash
omp -p "Authorized Web/API test against http://127.0.0.1:18080. Verify whether a low-privileged user can read another user's order through /api/orders/:id. Record every confirmed finding and stop after a high-impact finding is confirmed."
```

Expected smoke outputs:

- stdout contains the final Markdown report.
- `REPORT.md` exists and matches the final report content.
- `redteam-findings/findings.jsonl` exists.
- Each finding has readable `01_request.http` and `01_response.http` files.
- `REPORT.md` references every evidence path returned by the recorder.

## Final Report Shape

`REPORT.md` should include:

- Summary
- Scope
- Findings
- Evidence
- Impact
- Recommendations

For every finding, include severity, vulnerability name, impact, affected target or endpoint, and evidence paths.
