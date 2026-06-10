# Red-Team Worker Agent Bootstrap

This is the initial bootstrap note for the OMP red-team worker fork. It stores local test paths and non-secret routing defaults only. Do not paste OAuth tokens, API keys, cookies, or auth-broker token contents into this file.

## Local GPT/OMP Auth For Testing

Use the existing local OMP auth material for OpenAI-backed planning and reporting:

- OMP agent config: `/Users/xiaomai/.omp/agent/config.yml`
- OMP auth broker token: `/Users/xiaomai/.omp/auth-broker.token`

For worker-container tests, mount these files as secrets and keep the same destination paths, or map them with environment variables:

```bash
export OMP_AUTH_CONFIG=/Users/xiaomai/.omp/agent/config.yml
export OMP_AUTH_BROKER_TOKEN=/Users/xiaomai/.omp/auth-broker.token
```

Current local OMP config shape:

```yaml
modelRoles:
  default: openai-codex/gpt-5.5
  task:
    agentModelOverrides:
      explore: pi/default
      plan: pi/default
      designer: pi/default
      reviewer: pi/default
      task: pi/default
      quick_task: pi/default
      librarian: pi/default
      oracle: pi/default
```

## DeepSeek Execute Model Test

Keep the DeepSeek key out of the repository. Load it from the shell, scheduler secret store, or worker-container secret injection:

```bash
export DEEPSEEK_API_KEY="<set in secret store>"
export DEEPSEEK_BASE_URL="https://ai-api-gateway.app.baizhi.cloud/api/anthropic"
export DEEPSEEK_MODEL="vip/deepseek-v4-pro"
```

Anthropic-compatible smoke request:

```bash
curl -sS "$DEEPSEEK_BASE_URL/v1/messages" \
  -H "x-api-key: $DEEPSEEK_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"vip/deepseek-v4-pro","max_tokens":32,"messages":[{"role":"user","content":"Reply with exactly: ok"}]}'
```

## Intended Routing

- Plan: OpenAI subscription through the local OMP GPT auth.
- Execute: DeepSeek through the Anthropic-compatible gateway above.
- Report: OpenAI subscription through the local OMP GPT auth.

## Local Packaged OMP

- Built binary: `/Users/xiaomai/.codex/worktrees/f39f/omp/packages/coding-agent/dist/omp`
- Active PATH symlink: `/Users/xiaomai/.local/bin/omp`
- Version: `omp/15.10.12`
- Smoke: `omp --smoke-test` returns `smoke-test: ok`

Use this packaged `omp` for local auth and worker smoke tests:

```bash
omp auth-broker login openai-codex
omp auth-broker login anthropic
omp --model openai-codex/gpt-5.5 --no-tools --no-session -p 'Reply exactly: omp-gpt-auth-ok'
```

## Local Verification Status

- `bun packages/coding-agent/src/cli.ts --smoke-test`: passed after installing workspace dependencies and building `packages/natives` for `darwin-arm64`.
- DeepSeek gateway smoke: passed with `POST $DEEPSEEK_BASE_URL/v1/messages`, `x-api-key`, and model `vip/deepseek-v4-pro`.
- GPT/OMP auth smoke: passed after re-login. `omp --model openai-codex/gpt-5.5 --no-tools --no-session -p 'Reply exactly: omp-gpt-auth-ok'` returned `omp-gpt-auth-ok`.
- OpenAI/Codex usage check: passed. `omp usage --provider openai-codex --redact --json` returned an allowed `pro` account with available 5-hour and 7-day capacity.

## Required Worker Artifacts

- `REPORT.md`
- `redteam-findings/findings.jsonl`
- `redteam-findings/burp/<finding_id>/01_request.http`
- `redteam-findings/burp/<finding_id>/01_response.http`
