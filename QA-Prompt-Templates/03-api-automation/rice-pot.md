# API Automation · RICE-POT

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `10` |
| `{{API_TOOL}}` | Yes | API testing library | `REST Assured`, `Playwright APIRequestContext`, `requests` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java`, `TypeScript`, `Python` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG`, `JUnit 5`, `pytest` |
| `{{API_NAME}}` | Yes | API or service under test | `Orders Service` |
| `{{CONFIG_SOURCE}}` | Yes | Where the base URL, timeouts and test data come from | `src/test/resources/api.properties + env vars` |
| `{{AUTH_SECRET_KEYS}}` | Yes | Names of the env vars or config keys that hold secrets (never the values) | `API_CLIENT_ID, API_CLIENT_SECRET` |
| `{{REPORTING_TOOL}}` | Yes | Report library | `Allure` |
| `{{RESPONSE_TIME_THRESHOLD_MS}}` | Optional | Maximum acceptable response time | `800` |
| `{{API_BASE_URL}}` | Yes | Base URL. The prompt tells the model to read it from config | `https://<host>/api/v1` |
| `{{AUTH_TYPE}}` | Yes | Authentication mechanism | `Bearer token (OAuth2 client credentials)`, `API key header` |
| `{{ENDPOINTS_UNDER_TEST}}` | Yes | Method and path of each endpoint in scope | `POST /orders`, `GET /orders/{id}` |
| `{{API_SPEC}}` | Yes | OpenAPI or Swagger extract, or a pasted endpoint description | YAML, JSON or a table |
| `{{SAMPLE_REQUESTS_RESPONSES}}` | Optional | Real request and response examples, with secrets masked | pasted JSON |
| `{{ERROR_CONTRACT}}` | Optional | Error response format and codes | `{ "code": "...", "message": "..." }`, 400/401/404/409 |
| `{{TEST_SCENARIOS}}` | Optional | Specific scenarios that must be included | `1. Create an order with an invalid quantity returns 400` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `rate limiting, load testing` |
| `{{CODE_STYLE_EXAMPLE}}` | Optional | A snippet from your codebase that shows its style | an existing test method |
| `{{LANGUAGE_VERSION}}` | Yes | Language or runtime version | `17`, `Node 20`, `3.12` |
| `{{BUILD_TOOL}}` | Yes | Build or dependency tool | `Maven`, `Gradle`, `pip`, `npm` |
| `{{DEPENDENCY_VERSIONS}}` | Yes | Exact versions to pin, one per line | `<library> 5.x.y` |
| `{{BASE_PACKAGE}}` | Yes | Root package or folder | `com.company.api` |
| `{{OUTPUT_FILES}}` | Yes | Files to generate, with paths | `pom.xml`, `.../OrdersApiTest.java` |

## Prompt

```text
R — Role
You are a senior API test automation engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience testing REST services. You are an expert in {{API_TOOL}} with {{LANGUAGE}}, {{TEST_RUNNER}}, JSON Schema validation, HTTP semantics and authentication flows.

I — Instructions
- Generate an automated API test suite for the endpoints of {{API_NAME}} listed in Context.
[Mandatory] For each endpoint, cover:
  - Positive: valid request → expected status code, response body fields, headers (Content-Type) and schema.
  - Negative: missing required fields, wrong data types, invalid enum values, malformed JSON.
  - Boundary: min and max lengths and values, empty strings, empty arrays, where the spec defines limits.
  - Auth: missing credentials, invalid credentials, expired or insufficient-scope credentials, where the auth type supports them.
  - Not found or conflict cases where the spec defines them.
[Mandatory] Validate every successful response against a JSON Schema derived only from the spec.
[Mandatory] Validate error responses against the error contract in Context.
[Mandatory] Create a reusable request specification or client: base URL, default headers, auth and logging set in one place.
[Mandatory] Model request bodies as data objects or builders. Do not concatenate JSON strings.
[Mandatory] Tests must be independent. Each test creates the data it needs and cleans it up afterwards; there is no ordering dependency between tests.
[Mandatory] Read the base URL, timeouts and test data from {{CONFIG_SOURCE}}. Read secrets only from {{AUTH_SECRET_KEYS}}. Never hard-code them.
[Mandatory] Use data-driven tests for the negative and boundary input sets.
[Mandatory] Integrate {{REPORTING_TOOL}}: attach each request and response to the report, with authorization headers and secrets masked.
[Mandatory] If a response time threshold is given, assert that each response is within {{RESPONSE_TIME_THRESHOLD_MS}} ms (optional).
[Don't] Do not assert on fields, codes or messages that are not in the spec or the samples.
[Don't] Do not use hard sleeps. If an operation is asynchronous, poll with a bounded timeout.
[Don't] Do not disable TLS verification unless the config explicitly enables it for a test environment.

C — Context
API: {{API_NAME}}
Base URL (read it from config): {{API_BASE_URL}}
Authentication: {{AUTH_TYPE}}
Endpoints in scope: {{ENDPOINTS_UNDER_TEST}}
API specification:
"""
{{API_SPEC}}
"""
Sample requests and responses (optional, secrets masked):
"""
{{SAMPLE_REQUESTS_RESPONSES}}
"""
Error contract (optional):
"""
{{ERROR_CONTRACT}}
"""
Scenarios that must be included (optional):
"""
{{TEST_SCENARIOS}}
"""
Out of scope: {{OUT_OF_SCOPE}}

E — Example
Match the style of this snippet (optional; if it is empty, follow the Parameters section):
"""
{{CODE_STYLE_EXAMPLE}}
"""

P — Parameters
- Target {{LANGUAGE}} {{LANGUAGE_VERSION}}. Use {{BUILD_TOOL}} with these pinned versions:
"""
{{DEPENDENCY_VERSIONS}}
"""
- Root package or folder: {{BASE_PACKAGE}}.
- Test names follow the pattern <operation>_<condition>_<expectedOutcome>, for example <createResource>_withMissingRequiredField_returns<status>.
- Store the schema files under the test resources folder, one file per response type.

O — Output
[Output] Return:
1. A coverage table: endpoint, scenario, expected status, test method name.
2. These files, each preceded by its path:
"""
{{OUTPUT_FILES}}
"""
3. The run command.
No other explanation.

T — Tone
Technical and precise. Code first.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent endpoints, fields, status codes, headers or messages.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" API behaviour.
- Never output real credentials, tokens or personal data.
- The output must be deterministic. Use fixed test data, or unique IDs made from a configurable prefix.
```
