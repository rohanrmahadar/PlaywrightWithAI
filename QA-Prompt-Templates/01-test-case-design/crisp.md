# Test Case Design · CRISP

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
| `{{REQUIREMENTS}}` | Yes | User story, acceptance criteria or PRD extract, pasted in full | `As a user I want to... AC1: ...` |
| `{{BUSINESS_RULES}}` | Optional | Validations, limits, formats, permissions | `Password 8 to 64 chars, 1 digit` |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the QA persona | `10` |
| `{{PRIORITY_SCHEME}}` | Yes | How to rank test cases | `P1 (critical) / P2 (major) / P3 (minor)` |
| `{{TEST_TYPES}}` | Yes | Test types to cover | `functional, negative, boundary, UI, accessibility` |
| `{{SUPPORTED_ENVIRONMENTS}}` | Optional | Browsers, devices or OS versions in scope | `Chrome, Firefox, Safari (latest)` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `Social login, email delivery` |
| `{{MAX_TEST_CASES}}` | Yes | Upper limit on test cases generated | `40` |
| `{{OUTPUT_FORMAT}}` | Yes | Shape of the output | `Markdown table`, `CSV` |
| `{{TEST_CASE_ID_PREFIX}}` | Yes | Prefix for test case IDs | `TC_REG` |

## Prompt

```text
C — Context
Feature: {{FEATURE_NAME}} in {{APPLICATION_NAME}} ({{DOMAIN}}, {{PLATFORM}}).
Requirements:
"""
{{REQUIREMENTS}}
"""
Business rules (optional):
"""
{{BUSINESS_RULES}}
"""

R — Role
Act as a senior QA engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience in test design for {{DOMAIN}} products.

I — Instructions
1. Identify every testable condition in the requirements.
2. Design test cases using equivalence partitioning, boundary value analysis and error guessing.
3. Write at least one positive and one negative case per acceptance criterion.
4. Prioritise each case with {{PRIORITY_SCHEME}}.
5. List any unclear requirement as a question instead of guessing.

S — Scope
In scope: {{TEST_TYPES}} for {{FEATURE_NAME}}, on {{SUPPORTED_ENVIRONMENTS}} (optional).
Out of scope: {{OUT_OF_SCOPE}}.
Limit: at most {{MAX_TEST_CASES}} test cases. One behaviour per test case.

P — Presentation
{{OUTPUT_FORMAT}} with these columns: ID ({{TEST_CASE_ID_PREFIX}}_<number>), Title (starts with "Verify"), Requirement, Preconditions, Test Data, Steps, Expected Result, Priority, Type.
After the table, add the open questions and a one-line coverage summary.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent features, fields, messages, limits or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
