# Test Case Design · STAR

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
| `{{RELEASE_NAME}}` | Yes | Release or sprint the testing is for | `Sprint 14` |
| `{{KNOWN_RISK_AREAS}}` | Yes | Areas with past defects or high business impact | `discount calculation, session timeout` |
| `{{REQUIREMENTS}}` | Yes | User story, acceptance criteria or PRD extract, pasted in full | `As a user I want to... AC1: ...` |
| `{{BUSINESS_RULES}}` | Optional | Validations, limits, formats, permissions | `Password 8 to 64 chars, 1 digit` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `Social login, email delivery` |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the QA persona | `10` |
| `{{MAX_TEST_CASES}}` | Yes | Upper limit on test cases generated | `40` |
| `{{TEST_TYPES}}` | Yes | Test types to cover | `functional, negative, boundary, UI, accessibility` |
| `{{PRIORITY_SCHEME}}` | Yes | How to rank test cases | `P1 (critical) / P2 (major) / P3 (minor)` |
| `{{OUTPUT_FORMAT}}` | Yes | Shape of the output | `Markdown table`, `CSV` |
| `{{TEST_CASE_ID_PREFIX}}` | Yes | Prefix for test case IDs | `TC_REG` |

## Prompt

```text
S — Situation
Our team is preparing to test the {{FEATURE_NAME}} feature of {{APPLICATION_NAME}}, a {{DOMAIN}} {{PLATFORM}} application, for {{RELEASE_NAME}}. Testing time is limited, so the suite must put the riskiest areas first. Areas with past defects or high business impact: {{KNOWN_RISK_AREAS}}.
Requirements:
"""
{{REQUIREMENTS}}
"""
Business rules (optional):
"""
{{BUSINESS_RULES}}
"""
Out of scope: {{OUT_OF_SCOPE}}.

T — Task
Act as a senior QA engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience. Design a risk-based set of at most {{MAX_TEST_CASES}} test cases that covers {{TEST_TYPES}}. Every acceptance criterion must be covered, and the known risk areas must be covered in more depth.

A — Action
1. Break the requirements into testable conditions and give each one its requirement ID.
2. Rate each condition's risk as High, Medium or Low, based on business impact and likelihood of failure. Treat the known risk areas as High unless the requirements say otherwise.
3. Apply equivalence partitioning, boundary value analysis (min-1, min, max, max+1), decision tables and state transition testing where they fit.
4. Write more, and deeper, test cases for High-risk conditions. Low-risk conditions get at least one positive case.
5. Assign each test case a priority using {{PRIORITY_SCHEME}}.
6. List any ambiguous or missing requirement as a question instead of assuming.

R — Result
1. Risk table: condition, requirement ID, risk rating, reason.
2. Test cases in {{OUTPUT_FORMAT}} format with these columns: ID ({{TEST_CASE_ID_PREFIX}}_<number>), Title, Requirement, Risk, Preconditions, Test Data, Steps, Expected Result, Priority, Type.
3. Recommended execution order for {{RELEASE_NAME}}.
4. Open questions and coverage gaps.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent features, fields, messages, limits or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
