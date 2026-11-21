# Bug Reporting · CRISP

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{APPLICATION_NAME}}` | Yes | Application under test | `Merchant Dashboard` |
| `{{BUILD_VERSION}}` | Yes | Build, version or commit that was tested | `2.14.0-rc3` |
| `{{ENVIRONMENT}}` | Yes | Test environment | `QA`, `Staging` |
| `{{PLATFORM_DETAILS}}` | Yes | OS, browser or device, and version | `Windows 11 / Chrome 131` |
| `{{REPRODUCIBILITY}}` | Yes | How often it happens | `Always`, `3 out of 10 attempts`, `Once` |
| `{{RAW_NOTES}}` | Yes | Your unedited notes about what happened | free text |
| `{{EXPECTED_BEHAVIOUR}}` | Yes | What should have happened | `refund status changes to Pending` |
| `{{ACTUAL_BEHAVIOUR}}` | Yes | What did happen | `spinner never stops; console shows a 500` |
| `{{EVIDENCE}}` | Optional | Logs, console or network errors, and a description of screenshots or video | pasted log lines |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `8` |
| `{{SUMMARY_MAX_LENGTH}}` | Yes | Maximum length of the summary or title, in characters | `120` |
| `{{SEVERITY_SCALE}}` | Yes | Your team's severity definitions | `Blocker / Critical / Major / Minor / Trivial` with a meaning for each |
| `{{PRIORITY_SCALE}}` | Yes | Your team's priority definitions | `P1 to P4` |
| `{{BUG_REPORT_FIELDS}}` | Yes | Fields your tracker or team template requires, in order | `Summary, Environment, Steps, Expected, Actual, Severity, Priority, Attachments` |
| `{{BUG_TRACKER}}` | Yes | Where the bug will be logged | `Jira`, `Azure DevOps`, `GitHub Issues` |

## Prompt

```text
C — Context
{{APPLICATION_NAME}}, build {{BUILD_VERSION}}, {{ENVIRONMENT}}, {{PLATFORM_DETAILS}}. Reproducibility: {{REPRODUCIBILITY}}.
Notes:
"""
{{RAW_NOTES}}
"""
Expected: {{EXPECTED_BEHAVIOUR}}
Actual: {{ACTUAL_BEHAVIOUR}}
Evidence (optional):
"""
{{EVIDENCE}}
"""

R — Role
Act as a senior QA engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience writing triage-ready bug reports.

I — Instructions
1. Write a summary of {{SUMMARY_MAX_LENGTH}} characters or fewer: "<Component>: <problem> when <condition>".
2. Write a precondition and numbered steps to reproduce. Mark unclear steps "[Tester to confirm]".
3. Write Expected and Actual separately. Quote messages exactly.
4. Choose severity from {{SEVERITY_SCALE}} and priority from {{PRIORITY_SCALE}}, with a one-line reason each.

S — Scope
Describe only what was observed. Leave out any root cause analysis, and any extra issues not in the notes.

P — Presentation
Fields in this order: {{BUG_REPORT_FIELDS}}. Plain text, ready to paste into {{BUG_TRACKER}}.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent steps, messages, codes or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Never output real credentials, tokens or personal data.
```
