# API Automation · CRISP

Use this version to add tests for one or two endpoints to an existing suite.

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{API_TOOL}}` | Yes | API testing library | `REST Assured`, `Playwright APIRequestContext`, `requests` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java`, `TypeScript`, `Python` |
| `{{LANGUAGE_VERSION}}` | Yes | Language or runtime version | `17`, `Node 20`, `3.12` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG`, `JUnit 5`, `pytest` |
| `{{BASE_PACKAGE}}` | Yes | Root package or folder | `com.company.api` |
| `{{EXISTING_CODE}}` | Yes | Existing base classes or helpers to build on | pasted code |
| `{{ENDPOINTS_UNDER_TEST}}` | Yes | Method and path of each endpoint in scope | `POST /orders`, `GET /orders/{id}` |
| `{{API_NAME}}` | Yes | API or service under test | `Orders Service` |
| `{{AUTH_TYPE}}` | Yes | Authentication mechanism | `Bearer token (OAuth2 client credentials)`, `API key header` |
| `{{API_SPEC}}` | Yes | OpenAPI or Swagger extract, or a pasted endpoint description | YAML, JSON or a table |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `10` |
| `{{CONFIG_SOURCE}}` | Yes | Where the base URL, timeouts and test data come from | `src/test/resources/api.properties + env vars` |
| `{{AUTH_SECRET_KEYS}}` | Yes | Names of the env vars or config keys that hold secrets (never the values) | `API_CLIENT_ID, API_CLIENT_SECRET` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `rate limiting, load testing` |

## Prompt

```text
C — Context
Existing suite: {{API_TOOL}}, {{LANGUAGE}} {{LANGUAGE_VERSION}}, {{TEST_RUNNER}}. Root package: {{BASE_PACKAGE}}.
Relevant existing code (base class, request spec, helpers):
"""
{{EXISTING_CODE}}
"""
New endpoints: {{ENDPOINTS_UNDER_TEST}} of {{API_NAME}}. Auth: {{AUTH_TYPE}}.
Spec extract:
"""
{{API_SPEC}}
"""

R — Role
Act as a senior API automation engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience with {{API_TOOL}}.

I — Instructions
1. Reuse the existing base class and request spec. Do not create a parallel setup.
2. For each endpoint, write positive, negative, boundary and auth tests, using only what the spec defines.
3. Validate successful responses against a JSON Schema built from the spec.
4. Use data-driven tests for invalid inputs.
5. Read any new data from {{CONFIG_SOURCE}}. Read secrets only from {{AUTH_SECRET_KEYS}}.

S — Scope
In scope: the endpoints listed above.
Out of scope: changes to existing tests, and {{OUT_OF_SCOPE}}.

P — Presentation
1. A short coverage table: endpoint, scenario, expected status.
2. The new files and any new config keys, each preceded by its path. No other prose.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent endpoints, fields, status codes, headers or messages.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" API behaviour.
- Never output real credentials, tokens or personal data.
```
