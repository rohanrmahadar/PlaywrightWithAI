# API Automation · STAR

Use this version for an end-to-end business flow made of chained API calls.

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
| `{{BUSINESS_FLOW}}` | Yes | The end-to-end flow, step by step | `create a customer, then create an order, pay, check the status` |
| `{{ENDPOINTS_UNDER_TEST}}` | Yes | Method and path of each endpoint in scope | `POST /orders`, `GET /orders/{id}` |
| `{{AUTH_TYPE}}` | Yes | Authentication mechanism | `Bearer token (OAuth2 client credentials)`, `API key header` |
| `{{AUTH_SECRET_KEYS}}` | Yes | Names of the env vars or config keys that hold secrets (never the values) | `API_CLIENT_ID, API_CLIENT_SECRET` |
| `{{API_BASE_URL}}` | Yes | Base URL. The prompt tells the model to read it from config | `https://<host>/api/v1` |
| `{{CONFIG_SOURCE}}` | Yes | Where the base URL, timeouts and test data come from | `src/test/resources/api.properties + env vars` |
| `{{API_SPEC}}` | Yes | OpenAPI or Swagger extract, or a pasted endpoint description | YAML, JSON or a table |
| `{{SAMPLE_REQUESTS_RESPONSES}}` | Optional | Real request and response examples, with secrets masked | pasted JSON |
| `{{ERROR_CONTRACT}}` | Optional | Error response format and codes | `{ "code": "...", "message": "..." }`, 400/401/404/409 |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `10` |
| `{{API_TOOL}}` | Yes | API testing library | `REST Assured`, `Playwright APIRequestContext`, `requests` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java`, `TypeScript`, `Python` |
| `{{LANGUAGE_VERSION}}` | Yes | Language or runtime version | `17`, `Node 20`, `3.12` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG`, `JUnit 5`, `pytest` |
| `{{RESPONSE_TIME_THRESHOLD_MS}}` | Optional | Maximum acceptable response time | `800` |
| `{{REPORTING_TOOL}}` | Yes | Report library | `Allure` |
| `{{BUILD_TOOL}}` | Yes | Build or dependency tool | `Maven`, `Gradle`, `pip`, `npm` |
| `{{DEPENDENCY_VERSIONS}}` | Yes | Exact versions to pin, one per line | `<library> 5.x.y` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be tested | `rate limiting, load testing` |
| `{{BASE_PACKAGE}}` | Yes | Root package or folder | `com.company.api` |
| `{{OUTPUT_FILES}}` | Yes | Files to generate, with paths | `pom.xml`, `.../OrdersApiTest.java` |

## Prompt

```text
S — Situation
{{API_NAME}} supports this business flow, which is currently tested by hand:
"""
{{BUSINESS_FLOW}}
"""
The flow uses these endpoints: {{ENDPOINTS_UNDER_TEST}}. Auth: {{AUTH_TYPE}}. Secrets are in {{AUTH_SECRET_KEYS}}. The base URL ({{API_BASE_URL}}) and test data come from {{CONFIG_SOURCE}}.
Specification:
"""
{{API_SPEC}}
"""
Samples (optional, secrets masked):
"""
{{SAMPLE_REQUESTS_RESPONSES}}
"""
Error contract (optional):
"""
{{ERROR_CONTRACT}}
"""

T — Task
Act as a senior API automation engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience. Automate this flow with {{API_TOOL}}, {{LANGUAGE}} {{LANGUAGE_VERSION}} and {{TEST_RUNNER}}. The happy path must run end to end, and each step must also have tests showing it fails correctly when the previous step's output is invalid or missing.

A — Action
1. Map the flow: for each step, list its request, the values it needs from earlier steps (IDs, tokens, ETags) and the values it passes on.
2. Build a reusable client or request specification with auth and masked logging.
3. Write the happy-path test. Extract each value from one response and pass it to the next request. Validate every response against a schema built from the spec.
4. For each step, write negative tests: invalid or missing upstream ID, wrong state transition, unauthorised caller. Use only the error behaviour the spec or error contract defines.
5. Add cleanup that removes the data created, in reverse order, even when a test fails.
6. If {{RESPONSE_TIME_THRESHOLD_MS}} is set, assert it for each step (optional).
7. Integrate {{REPORTING_TOOL}}, with one report step per flow step.
8. Pin these exact versions in the {{BUILD_TOOL}} build file:
"""
{{DEPENDENCY_VERSIONS}}
"""
Do not test: {{OUT_OF_SCOPE}}.

R — Result
1. A flow diagram in text: step → endpoint → values extracted → next step.
2. A coverage table: step, scenario, expected status.
3. These files, each preceded by its path ({{BASE_PACKAGE}}):
"""
{{OUTPUT_FILES}}
"""
4. The run command.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent endpoints, fields, status codes, state transitions or messages.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" API behaviour.
- Never output real credentials, tokens or personal data.
```
