# Test Case Design · RICE-POT

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the QA persona | `10` |
| `{{DOMAIN}}` | Yes | Business domain | `insurance` |
| `{{PLATFORM}}` | Yes | Type of application | `web`, `mobile`, `REST API` |
| `{{FEATURE_NAME}}` | Yes | Feature or module being tested | `User registration` |
| `{{APPLICATION_NAME}}` | Yes | Application under test | `Policy Admin Portal` |
| `{{TEST_TYPES}}` | Yes | Test types to cover | `functional, negative, boundary, UI, accessibility` |
| `{{PRIORITY_SCHEME}}` | Yes | How to rank test cases | `P1 (critical) / P2 (major) / P3 (minor)` |
| `{{MAX_TEST_CASES}}` | Yes | Upper limit on test cases generated | `40` |
| `{{REQUIREMENTS}}` | Yes | User story, acceptance criteria or PRD extract, pasted in full | `As a user I want to... AC1: ...` |
| `{{BUSINESS_RULES}}` | Optional | Validations, limits, formats, permissions | `Password 8 to 64 chars, 1 digit` |
| `{{SUPPORTED_ENVIRONMENTS}}` | Optional | Browsers, devices or OS versions in scope | `Chrome, Firefox, Safari (latest)` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `Social login, email delivery` |
| `{{TEST_CASE_ID_PREFIX}}` | Yes | Prefix for test case IDs | `TC_REG` |
| `{{OUTPUT_FORMAT}}` | Yes | Shape of the output | `Markdown table`, `CSV` |

## Prompt

```text
R — Role
You are a senior QA engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience testing {{DOMAIN}} applications. You are an expert in requirement analysis and test design techniques: equivalence partitioning, boundary value analysis, decision tables, state transition testing and error guessing. You specialise in {{PLATFORM}} testing.

I — Instructions
- Analyse the requirements in Context and design test cases for the {{FEATURE_NAME}} feature of {{APPLICATION_NAME}}.
[Mandatory] Cover these test types: {{TEST_TYPES}}.
[Mandatory] Write at least one positive and one negative test case for every acceptance criterion.
[Mandatory] Apply boundary value analysis to every input that has a limit (length, range, count, date, amount): test min-1, min, max and max+1.
[Mandatory] Use a decision table wherever two or more conditions combine to change the outcome.
[Mandatory] Map every test case to the requirement or acceptance criterion ID it covers.
[Mandatory] Assign a priority to every test case using this scheme: {{PRIORITY_SCHEME}}.
[Mandatory] Before writing test cases, list every ambiguous, conflicting or missing requirement as a question for the product owner.
[Don't] Do not write test cases for anything listed under Out of scope.
[Don't] Do not combine several verifications in one test case. One test case checks one behaviour.
[Don't] Do not write vague expected results such as "works correctly" or "displays properly".
[Limit] Generate at most {{MAX_TEST_CASES}} test cases. If more are needed, list only the titles of the remaining ones.

C — Context
Application: {{APPLICATION_NAME}} ({{PLATFORM}}, {{DOMAIN}})
Feature: {{FEATURE_NAME}}
Requirements, user story and acceptance criteria:
"""
{{REQUIREMENTS}}
"""
Business rules and validations (optional):
"""
{{BUSINESS_RULES}}
"""
Supported environments (optional): {{SUPPORTED_ENVIRONMENTS}}
Out of scope: {{OUT_OF_SCOPE}}

E — Example
Follow the structure of this row exactly. The values in <angle brackets> are illustrative only.
| ID | Title | Requirement | Preconditions | Test Data | Steps | Expected Result | Priority | Type |
| {{TEST_CASE_ID_PREFIX}}_001 | Verify <behaviour> when <condition> | <AC id> | <state before the test> | <input values> | 1. <action> 2. <action> | <exact, observable outcome> | <priority> | <test type> |

P — Parameters
- Test case IDs use the prefix {{TEST_CASE_ID_PREFIX}} followed by a sequential number.
- Every title starts with "Verify".
- Steps are numbered and atomic, and someone who has never seen the application can execute them.
- Expected results are observable and measurable. Quote exact messages when the requirements give them.
- Test data is explicit. Where real data would be sensitive, use descriptive placeholders such as <valid_registered_email>.
- No duplicate or overlapping test cases.

O — Output
[Output] Return these sections in this order:
1. Clarifying questions (write "None" if there are none).
2. Test cases in {{OUTPUT_FORMAT}} format, with the columns shown in Example.
3. Traceability matrix: requirement ID → test case IDs.
4. Coverage gaps: requirements that could not be tested, and why.

T — Tone
Professional, precise and unambiguous. No filler text.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent features, fields, messages, limits or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
