# API Automation · CLEAR

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{API_NAME}}` | Yes | API or service under test | `Orders Service` |
| `{{API_TOOL}}` | Yes | API testing library | `REST Assured`, `Playwright APIRequestContext`, `requests` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java`, `TypeScript`, `Python` |
| `{{LANGUAGE_VERSION}}` | Yes | Language or runtime version | `17`, `Node 20`, `3.12` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG`, `JUnit 5`, `pytest` |
| `{{REPORTING_TOOL}}` | Yes | Report library | `Allure` |
| `{{CONFIG_SOURCE}}` | Yes | Where the base URL, timeouts and test data come from | `src/test/resources/api.properties + env vars` |
| `{{API_BASE_URL}}` | Yes | Base URL. The prompt tells the model to read it from config | `https://<host>/api/v1` |
| `{{AUTH_TYPE}}` | Yes | Authentication mechanism | `Bearer token (OAuth2 client credentials)`, `API key header` |
| `{{AUTH_SECRET_KEYS}}` | Yes | Names of the env vars or config keys that hold secrets (never the values) | `API_CLIENT_ID, API_CLIENT_SECRET` |
| `{{ENDPOINTS_UNDER_TEST}}` | Yes | Method and path of each endpoint in scope | `POST /orders`, `GET /orders/{id}` |
| `{{API_SPEC}}` | Yes | OpenAPI or Swagger extract, or a pasted endpoint description | YAML, JSON or a table |
| `{{ERROR_CONTRACT}}` | Optional | Error response format and codes | `{ "code": "...", "message": "..." }`, 400/401/404/409 |
| `{{SAMPLE_REQUESTS_RESPONSES}}` | Optional | Real request and response examples, with secrets masked | pasted JSON |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `rate limiting, load testing` |
| `{{DEPENDENCY_VERSIONS}}` | Yes | Exact versions to pin, one per line | `<library> 5.x.y` |
| `{{CODE_STYLE_EXAMPLE}}` | Optional | A snippet from your codebase that shows its style | an existing test method |
| `{{RESPONSE_TIME_THRESHOLD_MS}}` | Optional | Maximum acceptable response time | `800` |
| `{{BASE_PACKAGE}}` | Yes | Root package or folder | `com.company.api` |
| `{{OUTPUT_FILES}}` | Yes | Files to generate, with paths | `pom.xml`, `.../OrdersApiTest.java` |

## Prompt

```text
C — Context
I am automating API tests for {{API_NAME}} with {{API_TOOL}}, {{LANGUAGE}} {{LANGUAGE_VERSION}}, {{TEST_RUNNER}} and {{REPORTING_TOOL}}.
Base URL (it comes from {{CONFIG_SOURCE}}): {{API_BASE_URL}}
Authentication: {{AUTH_TYPE}}. Secrets are read only from {{AUTH_SECRET_KEYS}}.
Endpoints in scope: {{ENDPOINTS_UNDER_TEST}}
Specification:
"""
{{API_SPEC}}
"""
Error contract (optional):
"""
{{ERROR_CONTRACT}}
"""
Samples (optional, secrets masked):
"""
{{SAMPLE_REQUESTS_RESPONSES}}
"""

L — Limitations
- Assert only on fields, status codes, headers and messages that appear in the spec, the error contract or the samples.
- No hard-coded base URLs, secrets or environment-specific IDs.
- No JSON string concatenation. Use data objects or builders.
- No test may depend on another test's data or on execution order.
- No hard sleeps. Poll asynchronous operations with a bounded timeout.
- Mask authorization headers and secrets in all logs and report attachments.
- Do not test: {{OUT_OF_SCOPE}}.
- Pin exactly these versions:
"""
{{DEPENDENCY_VERSIONS}}
"""

E — Examples
Good: a test named <getResource>_withUnknownId_returns<not-found status from the spec> that asserts the status and validates the body against the error contract.
Bad: a test named test3 that asserts only that the status is not 500.
Good: a schema built from the spec, with "required" set and "additionalProperties" chosen to match the spec.
Bad: a schema with every field optional, which can never fail.
Style reference (optional):
"""
{{CODE_STYLE_EXAMPLE}}
"""

A — Action
1. For each endpoint, list its positive, negative (missing, wrong type, invalid value, malformed body), boundary, auth and not-found or conflict scenarios, using only what the spec defines.
2. Build one reusable request specification or client: base URL, headers, auth and masked logging.
3. Create request data objects or builders, and a JSON Schema per response type.
4. Write the tests. Use data-driven tests for the negative and boundary sets.
5. Add setup and cleanup so that each test owns its data.
6. If {{RESPONSE_TIME_THRESHOLD_MS}} is set, assert that responses stay within it (optional).
7. Self-check: every endpoint has every applicable category, and no assertion relies on something missing from the spec.

R — Result
1. Coverage table: endpoint, category, scenario, expected status, test name.
2. These files, each preceded by its path ({{BASE_PACKAGE}}):
"""
{{OUTPUT_FILES}}
"""
3. The run command.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent endpoints, fields, status codes, headers or messages.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" API behaviour.
- Never output real credentials, tokens or personal data.
```
