# Failure Analysis · RICE-POT

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `12` |
| `{{AUTOMATION_TOOL}}` | Yes | Tool used by the test | `Playwright`, `Selenium WebDriver`, `REST Assured` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG` |
| `{{TEST_NAME}}` | Yes | Fully qualified name of the failing test | `LoginTest.validLogin` |
| `{{FIX_CONSTRAINTS}}` | Optional | Fixes your team rules out | `no retries, no timeout increases` |
| `{{APPLICATION_NAME}}` | Optional | Application under test | `Customer Portal` |
| `{{FAILURE_PATTERN}}` | Yes | How often and where it fails | `fails 4 of 20 runs, only in CI, only on firefox` |
| `{{ENVIRONMENT_DETAILS}}` | Yes | Browser and version, headless or headed, OS, parallel threads, machine size | `chromium headless, 4 threads, 2 vCPU Linux agent` |
| `{{CI_SYSTEM}}` | Optional | Where the test runs | `GitHub Actions`, `Jenkins`, `GitLab CI` |
| `{{LAST_PASSING_RUN}}` | Optional | When or where it last passed | `build #812, local run` |
| `{{RECENT_CHANGES}}` | Optional | Recent changes to the app, tests, dependencies or infrastructure | `upgraded <tool> from x to y last week` |
| `{{ERROR_OUTPUT}}` | Yes | Error message, stack trace and relevant log lines | pasted text |
| `{{TEST_CODE}}` | Yes | The failing test's code | pasted code |
| `{{SUPPORTING_CODE}}` | Optional | Page objects, helpers, base class and hooks the test uses | pasted code |
| `{{ARTIFACT_NOTES}}` | Optional | What the screenshot, video, trace or HAR shows | `the screenshot shows a loading overlay still visible` |

## Prompt

```text
R — Role
You are a senior SDET with {{ROLE_EXPERIENCE_YEARS}} years of experience debugging automated test failures in {{AUTOMATION_TOOL}} with {{LANGUAGE}} and {{TEST_RUNNER}}, both locally and in CI. You are an expert in synchronisation problems, race conditions, test isolation, test data collisions and environment-specific failures.

I — Instructions
- Analyse the failure of {{TEST_NAME}} using only the evidence in Context.
[Mandatory] Read the stack trace from the top frame in the test code down. Identify the exact failing line and the failing operation (locator, wait, assertion, request, setup or teardown).
[Mandatory] Classify the failure as exactly one of: Test script defect, Product defect, Environment or infrastructure, Test data, Unknown. Give the evidence for the classification.
[Mandatory] List up to three root cause hypotheses, ranked by how strongly the evidence supports them. For each, cite the evidence that supports it and the evidence that would disprove it.
[Mandatory] For the top hypothesis, propose a fix that removes the cause: correct synchronisation, a stable locator, test isolation, unique data, or proper setup and teardown.
[Mandatory] Explain how to verify the fix, for example "run N times in CI conditions with no failures".
[Don't] Do not propose hard sleeps, blanket retries, increased global timeouts or weaker assertions as the fix. If a retry is genuinely appropriate (for example a known transient external dependency), justify it explicitly.
[Don't] Do not call it a product defect unless the evidence shows the application behaving against its expected behaviour.
[Don't] Respect these team constraints on fixes (optional): {{FIX_CONSTRAINTS}}

C — Context
Application (optional): {{APPLICATION_NAME}}
Test: {{TEST_NAME}}
Failure pattern: {{FAILURE_PATTERN}}
Environment: {{ENVIRONMENT_DETAILS}}, CI (optional): {{CI_SYSTEM}}
Last passing run (optional): {{LAST_PASSING_RUN}}
Recent changes (optional): {{RECENT_CHANGES}}
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
Artifact observations (optional):
"""
{{ARTIFACT_NOTES}}
"""

E — Example
Hypothesis 1 (High): <cause>
  Supports: <specific line in the error output, code or artifact>
  Would disprove: <observation that would rule it out>
  Fix: <change to a specific method or line>

P — Parameters
- Reference code by method name and line content, not by line number alone.
- Show the code fix as a minimal before/after diff of only the changed lines.
- Keep the fix consistent with the existing code style and framework patterns.

O — Output
[Output] Return these sections in order:
1. Failure point: file, method, operation.
2. Classification, with its evidence.
3. Ranked hypotheses, in the Example format.
4. Recommended fix, as a diff.
5. Verification steps.
6. Prevention: one or two framework-level changes that stop this class of failure.
7. Missing evidence that would raise confidence.

T — Tone
Analytical, evidence-based and concise.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent log lines, code, timings or application behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not claim a root cause that the evidence does not support. Use "Unknown" when the evidence is inconclusive.
- Never output real credentials, tokens or personal data that appear in logs. Mask them.
```
