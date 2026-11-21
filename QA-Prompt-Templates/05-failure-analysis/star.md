# Failure Analysis · STAR

Use this version for intermittent or flaky failures, especially ones that happen only in CI.

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
| `{{APPLICATION_NAME}}` | Optional | Application under test | `Customer Portal` |
| `{{FAILURE_PATTERN}}` | Yes | How often and where it fails | `fails 4 of 20 runs, only in CI, only on firefox` |
| `{{AUTOMATION_TOOL}}` | Yes | Tool used by the test | `Playwright`, `Selenium WebDriver`, `REST Assured` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG` |
| `{{CI_SYSTEM}}` | Optional | Where the test runs | `GitHub Actions`, `Jenkins`, `GitLab CI` |
| `{{ENVIRONMENT_DETAILS}}` | Yes | Browser and version, headless or headed, OS, parallel threads, machine size | `chromium headless, 4 threads, 2 vCPU Linux agent` |
| `{{LAST_PASSING_RUN}}` | Optional | When or where it last passed | `build #812, local run` |
| `{{RECENT_CHANGES}}` | Optional | Recent changes to the app, tests, dependencies or infrastructure | `upgraded <tool> from x to y last week` |
| `{{ERROR_OUTPUT}}` | Yes | Error message, stack trace and relevant log lines | pasted text |
| `{{TEST_CODE}}` | Yes | The failing test's code | pasted code |
| `{{SUPPORTING_CODE}}` | Optional | Page objects, helpers, base class and hooks the test uses | pasted code |
| `{{ARTIFACT_NOTES}}` | Optional | What the screenshot, video, trace or HAR shows | `the screenshot shows a loading overlay still visible` |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `12` |
| `{{FIX_CONSTRAINTS}}` | Optional | Fixes your team rules out | `no retries, no timeout increases` |

## Prompt

```text
S — Situation
The automated test {{TEST_NAME}} for {{APPLICATION_NAME}} (optional) is flaky. Pattern: {{FAILURE_PATTERN}}. It runs with {{AUTOMATION_TOOL}}, {{LANGUAGE}} and {{TEST_RUNNER}} on {{CI_SYSTEM}} (optional). Environment: {{ENVIRONMENT_DETAILS}}. Last passing run (optional): {{LAST_PASSING_RUN}}. Recent changes (optional): {{RECENT_CHANGES}}.
The team is losing trust in the suite and needs the cause fixed, not hidden.
Error output from the failing runs:
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

T — Task
Act as a senior SDET with {{ROLE_EXPERIENCE_YEARS}} years of experience stabilising flaky suites. Find out why the test is non-deterministic, propose a fix that removes the non-determinism, and give a plan to confirm it.

A — Action
1. Compare the passing and failing conditions in the pattern and environment: parallelism, browser, headless mode, machine resources, timing, data, test order.
2. Check the code for these flakiness sources:
   - missing or wrong synchronisation (for example acting before an element is actionable, or before network or animation has settled)
   - unstable locators
   - shared or static state between tests
   - test order dependency
   - test data collisions in parallel runs
   - time, timezone or locale dependency
   - unhandled asynchronous operations
   - incomplete teardown
3. Rank up to three hypotheses, each with its supporting evidence and the experiment that would confirm or rule it out.
4. Propose the fix for the top hypothesis. Do not use sleeps, blanket retries, higher global timeouts or weaker assertions. Team constraints (optional): {{FIX_CONSTRAINTS}}
5. Design a verification run: how many repetitions, under which conditions (matching the failing ones), and what pass rate counts as stable.
6. Suggest framework-level guards that prevent this class of flakiness in other tests.

R — Result
1. Passing vs. failing conditions table.
2. Flakiness source checklist: each source marked Found / Not found / Cannot tell, with the evidence.
3. Ranked hypotheses, each with a confirming experiment.
4. Fix, as a before/after diff.
5. Verification plan.
6. Prevention recommendations.
7. Missing evidence that would raise confidence.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent log lines, code, timings or application behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not claim a root cause that the evidence does not support. Use "Unknown" when the evidence is inconclusive.
- Never output real credentials, tokens or personal data that appear in logs. Mask them.
```
