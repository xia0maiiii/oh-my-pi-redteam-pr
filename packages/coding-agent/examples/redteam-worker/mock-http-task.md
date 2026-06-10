# Mock Red-Team Worker Task

Start the mock target:

```bash
bun packages/coding-agent/examples/redteam-worker/mock-http-server.ts
```

Run the worker:

```bash
omp -p "Authorized Web/API test against http://127.0.0.1:18080. Use Authorization: Bearer lowpriv-demo as the low-privileged user token. Verify whether /api/orders/1002 exposes another user's order. Record every confirmed finding and produce the final Markdown report."
```

Expected artifacts:

```text
REPORT.md
redteam-findings/findings.jsonl
redteam-findings/burp/<finding_id>/01_request.http
redteam-findings/burp/<finding_id>/01_response.http
```
