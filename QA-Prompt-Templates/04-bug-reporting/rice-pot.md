# Bug Reporting · RICE-POT

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `8` |
| `{{DOMAIN}}` | Optional | Business domain, used to judge impact | `fintech` |
| `{{BUG_TRACKER}}` | Yes | Where the bug will be logged | `Jira`, `Azure DevOps`, `GitHub Issues` |
| `{{SUMMARY_MAX_LENGTH}}` | Yes | Maximum length of the summary or title, in characters | `120` |
| `{{EXPECTED_BEHAVIOUR}}` | Yes | What should have happened | `refund status changes to Pending` |
| `{{REQUIREMENT_REFERENCE}}` | Optional | The story, acceptance criterion or spec that defines the expected behaviour | `STORY-123 AC2` |
| `{{SEVERITY_SCALE}}` | Yes | Your team's severity definitions | `Blocker / Critical / Major / Minor / Trivial` with a meaning for each |
| `{{PRIORITY_SCALE}}` | Yes | Your team's priority definitions | `P1 to P4` |
| `{{APPLICATION_NAME}}` | Yes | Application under test | `Merchant Dashboard` |
| `{{COMPONENT}}` | Optional | Module or component affected | `Payments > Refunds` |
| `{{BUILD_VERSION}}` | Yes | Build, version or commit that was tested | `2.14.0-rc3` |
| `{{ENVIRONMENT}}` | Yes | Test environment | `QA`, `Staging` |
| `{{PLATFORM_DETAILS}}` | Yes | OS, browser or device, and version | `Windows 11 / Chrome 131` |
| `{{TEST_DATA_USED}}` | Optional | Accounts or data used. Describe them; never give real credentials | `a standard user with 2 saved cards` |
| `{{REPRODUCIBILITY}}` | Yes | How often it happens | `Always`, `3 out of 10 attempts`, `Once` |
| `{{RAW_NOTES}}` | Yes | Your unedited notes about what happened | free text |
| `{{STEPS_PERFORMED}}` | Optional | The steps you remember, even partial ones | `opened refunds, clicked ...` |
| `{{ACTUAL_BEHAVIOUR}}` | Yes | What did happen | `spinner never stops; console shows a 500` |
| `{{EVIDENCE}}` | Optional | Logs, console or network errors, and a description of screenshots or video | pasted log lines |
| `{{AUDIENCE}}` | Optional | Who will read the report | `backend developers`, `product owner` |
| `{{BUG_REPORT_FIELDS}}` | Yes | Fields your tracker or team template requires, in order | `Summary, Environment, Steps, Expected, Actual, Severity, Priority, Attachments` |

## Prompt

```text
R — Role
You are a senior QA engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience writing defect reports for {{DOMAIN}} (optional) products. Your reports are known for being reproducible first time, neutral in tone and ready to triage.

I — Instructions
- Turn the tester notes and evidence in Context into one bug report for {{BUG_TRACKER}}.
[Mandatory] Write the summary as "<Component>: <what is wrong> when <condition>", in {{SUMMARY_MAX_LENGTH}} characters or fewer.
[Mandatory] Write the steps to reproduce as numbered, atomic actions that start from a clearly stated precondition. Include the exact test data used, described rather than given as real values.
[Mandatory] Keep Expected and Actual results separate. Base Expected only on {{EXPECTED_BEHAVIOUR}} and {{REQUIREMENT_REFERENCE}} (optional).
[Mandatory] Assign severity using only this scale: {{SEVERITY_SCALE}}. Assign priority using only this scale: {{PRIORITY_SCALE}}. Give a one-line reason for each.
[Mandatory] Quote error messages, status codes and log lines exactly as they appear in the evidence.
[Mandatory] If a step is unclear from the notes, mark it "[Tester to confirm]" instead of guessing it.
[Don't] Do not speculate about the root cause in the report body. You may add up to three "Possible areas to investigate" at the end, each labelled "Inference (low confidence)".
[Don't] Do not use blaming or emotional language.
[Don't] Do not include passwords, tokens, personal data or full card numbers. Mask any that appear in the evidence.

C — Context
Application: {{APPLICATION_NAME}}, component (optional): {{COMPONENT}}
Build: {{BUILD_VERSION}}, environment: {{ENVIRONMENT}}, platform: {{PLATFORM_DETAILS}}
Test data used (optional, descriptive only): {{TEST_DATA_USED}}
Reproducibility: {{REPRODUCIBILITY}}
Tester notes:
"""
{{RAW_NOTES}}
"""
Steps the tester remembers (optional):
"""
{{STEPS_PERFORMED}}
"""
Expected behaviour: {{EXPECTED_BEHAVIOUR}}
Actual behaviour: {{ACTUAL_BEHAVIOUR}}
Evidence (optional):
"""
{{EVIDENCE}}
"""

E — Example
Summary: <Component>: <action> fails with <visible error> when <condition>
Steps:
  Precondition: <user type> is logged in on <environment>
  1. Navigate to <screen>
  2. Enter <described data> in <field>
  3. Click <control>
Expected: <behaviour from the requirement>
Actual: <observed behaviour, with the exact message>

P — Parameters
- Write for {{AUDIENCE}} (optional).
- Fill the fields in exactly this order: {{BUG_REPORT_FIELDS}}.
- Keep the whole report to one screen if possible; put the full logs in an Attachments or Evidence section.

O — Output
[Output] A bug report ready to paste into {{BUG_TRACKER}}, with the fields in the order given, followed by:
- Missing information: anything the developer will need that the notes do not provide.
- Suggested labels or tags.

T — Tone
Factual, neutral and concise.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent steps, messages, codes or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
