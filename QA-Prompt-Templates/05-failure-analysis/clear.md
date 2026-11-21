# Failure Analysis · CLEAR

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{TEST_NAME}}` | Yes | Fully qualified name of the failing test | `LoginTest.validLogin` |
| `{{AUTOMATION_TOOL}}` | Yes | Tool used by the test | `Playwright`, `Selenium WebDriver`, `REST Assured` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG` |
| `{{FAILURE_PATTERN}}` | Yes | How often and where it fails | `fails 4 of 20 runs, only in CI, only on firefox` |
| `{{ENVIRONMENT_DETAILS}}` | Yes | Browser and version, headless or headed, OS, parallel threads, machine size | `chromium headless, 4 threads, 2 vCPU Linux agent` |
| `{{CI_SYSTEM}}` | Optional | Where the test runs | `GitHub Actions`, `Jenkins`, `GitLab CI` |
| `{{RECENT_CHANGES}}` | Optional | Recent changes to the app, tests, dependencies or infrastructure | `upgraded <tool> from x to y last week` |
| `{{ERROR_OUTPUT}}` | Yes | Error message, stack trace and relevant log lines | pasted text |
| `{{TEST_CODE}}` | Yes | The failing test's code | pasted code |
| `{{SUPPORTING_CODE}}` | Optional | Page objects, helpers, base class and hooks the test uses | pasted code |
| `{{ARTIFACT_NOTES}}` | Optional | What the screenshot, video, trace or HAR shows | `the screenshot shows a loading overlay still visible` |
| `{{FIX_CONSTRAINTS}}` | Optional | Fixes your team rules out | `no retries, no timeout increases` |

## Prompt

```text
C — Context
The automated test {{TEST_NAME}} ({{AUTOMATION_TOOL}}, {{LANGUAGE}}, {{TEST_RUNNER}}) is failing. Pattern: {{FAILURE_PATTERN}}. Environment: {{ENVIRONMENT_DETAILS}}. CI (optional): {{CI_SYSTEM}}. Recent changes (optional): {{RECENT_CHANGES}}.
Error output:
"""
{{ERROR_OUTPUT}}
"""
Test code:
"""
{{TEST_CODE}}
"""
Supporting code (optional):
"""
{{SUPPORTING_CODE}}
"""
Artifacts (optional):
"""
{{ARTIFACT_NOTES}}
"""

L — Limitations
- The fix must not be a hard sleep, a blanket retry, a higher global timeout, a weaker or removed assertion, or a skipped test.
- Base the diagnosis only on the evidence above. Do not invent log lines or behaviour.
- Do not label it a product defect without evidence that the application violated its expected behaviour.
- Change only what the fix needs. Do not refactor unrelated code.
- Team constraints (optional): {{FIX_CONSTRAINTS}}

E — Examples
Bad fix: add a 3-second sleep before the click.
Good fix: wait for the loading overlay to be hidden, or use an auto-waiting action on an actionable locator.
Bad fix: wrap the assertion in a retry loop.
Good fix: assert with a web-first or polling assertion, which already waits for the expected state.
Bad fix: hard-code a unique email so the test stops colliding.
Good fix: build the email from a configurable prefix plus a run-scoped unique suffix, and clean it up afterwards.

A — Action
1. Locate the failing line and operation from the stack trace.
2. Classify the failure: Test script defect, Product defect, Environment or infrastructure, Test data, or Unknown.
3. Rank up to three hypotheses, each with its supporting evidence and the evidence that would disprove it.
4. Propose a fix for the top hypothesis that complies with every Limitation.
5. Describe how to prove the fix works under the same conditions as the failure.

R — Result
Sections: Failure point, Classification, Hypotheses (ranked), Fix (before/after diff), Verification, Missing evidence.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent log lines, code, timings or application behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not claim a root cause that the evidence does not support. Use "Unknown" when the evidence is inconclusive.
- Never output real credentials, tokens or personal data that appear in logs. Mask them.
```
