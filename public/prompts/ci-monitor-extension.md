# CI Monitor — GitHub Copilot CLI Extension Prompt

Create a Copilot CLI extension at `.github/extensions/ci-monitor/extension.mjs` that monitors CI/CD checks after I push or create a PR, and sends the results back into my session automatically. This uses the Copilot SDK extension system (`@github/copilot-sdk`).

Use this production extension as the base: https://htek.dev/code/ci-monitor-extension.mjs

Adapt it to my project's specific setup:

- Detect which workflow(s) are relevant (look at my `.github/workflows/` directory)
- Parse deployment outputs that matter for this project (URLs, endpoints, health checks, whatever the workflows produce)
- If I have a deploy workflow, add structured summary markers (`---DEPLOY-SUMMARY-START---` / `---DEPLOY-SUMMARY-END---`) to the workflow so the extension can extract clean output
- Include PR comment polling so feedback I leave on the PR routes back into the session
- Keep the `check_ci_status` tool so the agent can poll CI status on demand

The key behaviors to preserve: auto-start monitoring on push/PR creation, use `gh pr checks --watch` (no custom polling), send results via `session.send()`, fetch failed job logs on failure, and filter deploy runs by current branch.
