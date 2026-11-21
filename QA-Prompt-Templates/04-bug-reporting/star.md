# Bug Reporting · STAR

Use this version for complex or intermittent defects, where the background and the business impact matter.

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
| `{{COMPONENT}}` | Optional | Module or component affected | `Payments > Refunds` |
| `{{BUILD_VERSION}}` | Yes | Build, version or commit that was tested | `2.14.0-rc3` |
| `{{ENVIRONMENT}}` | Yes | Test environment | `QA`, `Staging` |
| `{{PLATFORM_DETAILS}}` | Yes | OS, browser or device, and version | `Windows 11 / Chrome 131` |
| `{{REPRODUCIBILITY}}` | Yes | How often it happens | `Always`, `3 out of 10 attempts`, `Once` |
| `{{DOMAIN}}` | Optional | Business domain, used to judge impact | `fintech` |
| `{{RAW_NOTES}}` | Yes | Your unedited notes about what happened | free text |
| `{{STEPS_PERFORMED}}` | Optional | The steps you remember, even partial ones | `opened refunds, clicked ...` |
| `{{TEST_DATA_USED}}` | Optional | Accounts or data used. Describe them; never give real credentials | `a standard user with 2 saved cards` |
| `{{EXPECTED_BEHAVIOUR}}` | Yes | What should have happened | `refund status changes to Pending` |
| `{{REQUIREMENT_REFERENCE}}` | Optional | The story, acceptance criterion or spec that defines the expected behaviour | `STORY-123 AC2` |
| `{{ACTUAL_BEHAVIOUR}}` | Yes | What did happen | `spinner never stops; console shows a 500` |
| `{{EVIDENCE}}` | Optional | Logs, console or network errors, and a description of screenshots or video | pasted log lines |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `8` |
| `{{BUG_TRACKER}}` | Yes | Where the bug will be logged | `Jira`, `Azure DevOps`, `GitHub Issues` |
| `{{AUDIENCE}}` | Optional | Who will read the report | `backend developers`, `product owner` |
| `{{SEVERITY_SCALE}}` | Yes | Your team's severity definitions | `Blocker / Critical / Major / Minor / Trivial` with a meaning for each |
| `{{PRIORITY_SCALE}}` | Yes | Your team's priority definitions | `P1 to P4` |
| `{{BUG_REPORT_FIELDS}}` | Yes | Fields your tracker or team template requires, in order | `Summary, Environment, Steps, Expected, Actual, Severity, Priority, Attachments` |
| `{{SUMMARY_MAX_LENGTH}}` | Yes | Maximum length of the summary or title, in characters | `120` |

## Prompt

```text
S — Situation
While testing {{APPLICATION_NAME}} (component, optional: {{COMPONENT}}), build {{BUILD_VERSION}}, in {{ENVIRONMENT}} on {{PLATFORM_DETAILS}}, I hit a defect. It happens {{REPRODUCIBILITY}}. It affects a {{DOMAIN}} (optional) workflow.
Notes:
"""
{{RAW_NOTES}}
"""
Steps I remember (optional):
"""
{{STEPS_PERFORMED}}
"""
Test data (optional, descriptive only): {{TEST_DATA_USED}}
Expected: {{EXPECTED_BEHAVIOUR}} (source, optional: {{REQUIREMENT_REFERENCE}})
Actual: {{ACTUAL_BEHAVIOUR}}
Evidence (optional):
"""
{{EVIDENCE}}
"""

T — Task
Act as a senior QA engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience. Write a bug report for {{BUG_TRACKER}} that {{AUDIENCE}} (optional) can reproduce and prioritise without follow-up questions, even though the defect may not happen every time.

A — Action
1. Separate facts (what was observed) from assumptions. Use only the facts in the report body.
2. Write a precondition and numbered steps. Mark gaps "[Tester to confirm]".
3. If the defect is intermittent, list the conditions that were present when it happened and when it did not (timing, data, user, network, concurrency), but only those stated in the notes or evidence.
4. Describe the user and business impact in one or two sentences: who is affected, and what they cannot do.
5. Choose severity from {{SEVERITY_SCALE}} and priority from {{PRIORITY_SCALE}}, with a one-line reason each.
6. Suggest the extra evidence that would help (for example a HAR file, server logs for a time window, or a video).

R — Result
1. A report with these fields, in this order: {{BUG_REPORT_FIELDS}}. The summary is {{SUMMARY_MAX_LENGTH}} characters or fewer.
2. An "Occurrence conditions" section (for intermittent bugs).
3. An "Impact" section.
4. "Missing information / evidence to collect".
5. "Possible areas to investigate": at most three items, each labelled "Inference (low confidence)".

Guardrails
- Use only the information in this prompt and its attachments. Do not invent steps, messages, codes or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
