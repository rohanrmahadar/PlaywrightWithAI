# Failure Analysis · CRISP

Use this version for a test that fails consistently.

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
| `{{ERROR_OUTPUT}}` | Yes | Error message, stack trace and relevant log lines | pasted text |
| `{{TEST_CODE}}` | Yes | The failing test's code | pasted code |
| `{{SUPPORTING_CODE}}` | Optional | Page objects, helpers, base class and hooks the test uses | pasted code |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `12` |

## Prompt

```text
C — Context
Test {{TEST_NAME}} ({{AUTOMATION_TOOL}}, {{LANGUAGE}}, {{TEST_RUNNER}}) fails: {{FAILURE_PATTERN}}. Environment: {{ENVIRONMENT_DETAILS}}.
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

R — Role
Act as a senior SDET with {{ROLE_EXPERIENCE_YEARS}} years of experience debugging {{AUTOMATION_TOOL}} tests.

I — Instructions
1. Identify the failing line and operation.
2. Classify the failure: Test script defect, Product defect, Environment, Test data, or Unknown.
3. Give the most likely root cause and the evidence for it.
4. Give a minimal fix. No sleeps, retries, timeout increases or weaker assertions.

S — Scope
Only this test and the code it calls. Do not refactor unrelated code.

P — Presentation
Four short sections: Failure point, Classification, Root cause, Fix (before/after diff). Then one line saying how to verify the fix.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent log lines, code or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Never output real credentials, tokens or personal data that appear in logs. Mask them.
```
