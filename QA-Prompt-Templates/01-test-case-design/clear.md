# Test Case Design · CLEAR

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{FEATURE_NAME}}` | Yes | Feature or module being tested | `User registration` |
| `{{APPLICATION_NAME}}` | Yes | Application under test | `Policy Admin Portal` |
| `{{DOMAIN}}` | Yes | Business domain | `insurance` |
| `{{PLATFORM}}` | Yes | Type of application | `web`, `mobile`, `REST API` |
| `{{AUDIENCE}}` | Optional | Who will execute the test cases | `manual testers new to the product` |
| `{{TEST_MANAGEMENT_TOOL}}` | Optional | Where the cases will be imported | `TestRail`, `Zephyr`, `Xray` |
| `{{REQUIREMENTS}}` | Yes | User story, acceptance criteria or PRD extract, pasted in full | `As a user I want to... AC1: ...` |
| `{{BUSINESS_RULES}}` | Optional | Validations, limits, formats, permissions | `Password 8 to 64 chars, 1 digit` |
| `{{SUPPORTED_ENVIRONMENTS}}` | Optional | Browsers, devices or OS versions in scope | `Chrome, Firefox, Safari (latest)` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `Social login, email delivery` |
| `{{MAX_TEST_CASES}}` | Yes | Upper limit on test cases generated | `40` |
| `{{TEST_TYPES}}` | Yes | Test types to cover | `functional, negative, boundary, UI, accessibility` |
| `{{PRIORITY_SCHEME}}` | Yes | How to rank test cases | `P1 (critical) / P2 (major) / P3 (minor)` |
| `{{OUTPUT_FORMAT}}` | Yes | Shape of the output | `Markdown table`, `CSV` |
| `{{TEST_CASE_ID_PREFIX}}` | Yes | Prefix for test case IDs | `TC_REG` |

## Prompt

```text
C — Context
I am testing the {{FEATURE_NAME}} feature of {{APPLICATION_NAME}}, a {{DOMAIN}} {{PLATFORM}} application. The test cases will be executed by {{AUDIENCE}} and imported into {{TEST_MANAGEMENT_TOOL}} (optional).
Requirements, user story and acceptance criteria:
"""
{{REQUIREMENTS}}
"""
Business rules and validations (optional):
"""
{{BUSINESS_RULES}}
"""
Supported environments (optional): {{SUPPORTED_ENVIRONMENTS}}

L — Limitations
- Use only the requirements above. Do not add features or behaviour that they do not describe.
- Do not cover: {{OUT_OF_SCOPE}}.
- Generate at most {{MAX_TEST_CASES}} test cases.
- Each test case verifies exactly one behaviour.
- Expected results must be observable. Never write "should work" or "displays properly".
- Do not include real personal data or credentials. Use descriptive placeholders such as <valid_registered_email>.

E — Examples
Good title: "Verify an error is shown when <field> exceeds its maximum length"
Bad title: "Check field"
Good expected result: "<exact message from the requirements> is shown below <field> and the form is not submitted"
Bad expected result: "Error appears"
Good step: "Enter <value> in <field>"
Bad step: "Fill the form and submit and check the result"

A — Action
1. Read the requirements and list every testable condition, with its requirement ID.
2. List every ambiguous, conflicting or missing requirement as a question.
3. For each condition, apply equivalence partitioning, boundary value analysis (min-1, min, max, max+1) and, where conditions combine, a decision table.
4. Write test cases that cover these test types: {{TEST_TYPES}}.
5. Prioritise each test case using {{PRIORITY_SCHEME}}.
6. Self-check before answering: every acceptance criterion has a positive and a negative case, every limit has boundary cases, and there are no duplicates.

R — Result
1. Open questions (write "None" if there are none).
2. Test cases in {{OUTPUT_FORMAT}} format with these columns: ID ({{TEST_CASE_ID_PREFIX}}_<number>), Title, Requirement, Preconditions, Test Data, Steps, Expected Result, Priority, Type.
3. Traceability matrix: requirement ID → test case IDs.
4. Coverage gaps, with reasons.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent features, fields, messages, limits or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
