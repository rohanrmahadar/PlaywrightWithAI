# Bug Reporting · CLEAR

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
| `{{BUG_TRACKER}}` | Yes | Where the bug will be logged | `Jira`, `Azure DevOps`, `GitHub Issues` |
| `{{AUDIENCE}}` | Optional | Who will read the report | `backend developers`, `product owner` |
| `{{RAW_NOTES}}` | Yes | Your unedited notes about what happened | free text |
| `{{STEPS_PERFORMED}}` | Optional | The steps you remember, even partial ones | `opened refunds, clicked ...` |
| `{{EXPECTED_BEHAVIOUR}}` | Yes | What should have happened | `refund status changes to Pending` |
| `{{REQUIREMENT_REFERENCE}}` | Optional | The story, acceptance criterion or spec that defines the expected behaviour | `STORY-123 AC2` |
| `{{ACTUAL_BEHAVIOUR}}` | Yes | What did happen | `spinner never stops; console shows a 500` |
| `{{TEST_DATA_USED}}` | Optional | Accounts or data used. Describe them; never give real credentials | `a standard user with 2 saved cards` |
| `{{EVIDENCE}}` | Optional | Logs, console or network errors, and a description of screenshots or video | pasted log lines |
| `{{SEVERITY_SCALE}}` | Yes | Your team's severity definitions | `Blocker / Critical / Major / Minor / Trivial` with a meaning for each |
| `{{PRIORITY_SCALE}}` | Yes | Your team's priority definitions | `P1 to P4` |
| `{{SUMMARY_MAX_LENGTH}}` | Yes | Maximum length of the summary or title, in characters | `120` |
| `{{BUG_REPORT_FIELDS}}` | Yes | Fields your tracker or team template requires, in order | `Summary, Environment, Steps, Expected, Actual, Severity, Priority, Attachments` |

## Prompt

```text
C — Context
I found a defect in {{APPLICATION_NAME}} (component, optional: {{COMPONENT}}) on build {{BUILD_VERSION}}, in the {{ENVIRONMENT}} environment, on {{PLATFORM_DETAILS}}. It happens: {{REPRODUCIBILITY}}. The report goes into {{BUG_TRACKER}} and will be read by {{AUDIENCE}} (optional).
My notes:
"""
{{RAW_NOTES}}
"""
Steps I remember (optional):
"""
{{STEPS_PERFORMED}}
"""
Expected: {{EXPECTED_BEHAVIOUR}} (source, optional: {{REQUIREMENT_REFERENCE}})
Actual: {{ACTUAL_BEHAVIOUR}}
Test data (optional, descriptive only): {{TEST_DATA_USED}}
Evidence (optional):
"""
{{EVIDENCE}}
"""

L — Limitations
- Do not add steps that are not in my notes. Mark gaps "[Tester to confirm]".
- Do not state a root cause. Describe only what was observed.
- Quote messages, codes and log lines exactly as they appear. Do not paraphrase them.
- Severity must come from {{SEVERITY_SCALE}}, and priority from {{PRIORITY_SCALE}}.
- Mask passwords, tokens, personal data and card numbers.
- Summary: {{SUMMARY_MAX_LENGTH}} characters or fewer. No words like "broken", "terrible" or "doesn't work".

E — Examples
Good summary: "<Component>: <action> returns <exact error> when <condition>"
Bad summary: "<Feature> not working"
Good step: "Enter a value greater than the maximum allowed for <field> in <field>"
Bad step: "Do the usual checkout stuff"
Good actual result: "Page shows '<exact message>'; network tab shows <method> <path> → <status>"
Bad actual result: "It crashed"

A — Action
1. Pull the facts out of the notes and evidence: what was done, what was seen, and when.
2. Rebuild the steps as a precondition plus numbered actions.
3. Write Expected from the requirement and Actual from the evidence.
4. Choose severity and priority from the scales, with a one-line reason each.
5. List the information that is still missing.
6. Self-check: could someone who was not there reproduce this from the report alone?

R — Result
A report with these fields, in this order: {{BUG_REPORT_FIELDS}}. Then "Missing information" and "Suggested labels". Plain text, ready to paste into {{BUG_TRACKER}}.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent steps, messages, codes or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
