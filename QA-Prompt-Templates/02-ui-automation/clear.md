# UI Automation · CLEAR

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{AUTOMATION_TOOL}}` | Yes | UI automation tool | `Playwright`, `Selenium WebDriver` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java`, `TypeScript`, `Python` |
| `{{LANGUAGE_VERSION}}` | Yes | Language or runtime version | `17`, `Node 20`, `3.12` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG`, `JUnit 5`, `pytest`, `@playwright/test` |
| `{{BUILD_TOOL}}` | Yes | Build or dependency tool | `Maven`, `Gradle`, `npm` |
| `{{REPORTING_TOOL}}` | Yes | Report library | `Allure`, `ExtentReports` |
| `{{PAGE_NAME}}` | Yes | Page or flow being automated | `Login`, `Checkout` |
| `{{APPLICATION_NAME}}` | Yes | Application under test | `Admin Console` |
| `{{APPLICATION_URL}}` | Yes | URL of the page under test. The prompt tells the model to read it from config, not hard-code it | `https://<host>/<path>` |
| `{{ELEMENT_INVENTORY}}` | Yes | Elements and their locators, checked against the live DOM | `Email field: //input[@id='...']` |
| `{{PAGE_BEHAVIOUR}}` | Yes | Behaviour you observed on the real page (messages, redirects, defaults) | `Failed login shows "<message>"; URL unchanged` |
| `{{TEST_SCENARIOS}}` | Yes | Numbered list of scenarios to automate | `1. Valid login redirects away from the login page` |
| `{{LOCATOR_STRATEGY}}` | Yes | Allowed locator types, in order of preference | `data-testid, then id, then XPath` |
| `{{CONFIG_SOURCE}}` | Yes | Config file path, plus any override mechanism | `src/test/resources/config.properties, overridable with -D` |
| `{{CONFIG_KEYS}}` | Yes | Config keys the framework must use | `base.url, browser, headless, default.timeout.ms` |
| `{{CREDENTIAL_KEYS}}` | Yes | Names of the config keys or env vars holding credentials (never the values) | `valid.username, valid.password` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be automated | `SSO, MFA, CAPTCHA` |
| `{{DEPENDENCY_VERSIONS}}` | Yes | Exact versions to pin, one per line | `<tool> 1.x.y`, `<runner> 7.x.y` |
| `{{ADDITIONAL_RULES}}` | Optional | Team-specific rules | `Use java.util.logging only` |
| `{{CODE_STYLE_EXAMPLE}}` | Optional | A short snippet from your codebase that shows its style | a Page Object method |
| `{{OUTPUT_FILES}}` | Yes | Files to generate, one per line, with paths | `pom.xml`, `src/main/java/.../LoginPage.java` |

## Prompt

```text
C — Context
I need {{AUTOMATION_TOOL}} automation in {{LANGUAGE}} {{LANGUAGE_VERSION}}, using {{TEST_RUNNER}}, {{BUILD_TOOL}} and {{REPORTING_TOOL}}, for the {{PAGE_NAME}} page of {{APPLICATION_NAME}}.
Page URL (it comes from config): {{APPLICATION_URL}}
Elements, verified against the live DOM:
"""
{{ELEMENT_INVENTORY}}
"""
Observed behaviour:
"""
{{PAGE_BEHAVIOUR}}
"""
Scenarios:
"""
{{TEST_SCENARIOS}}
"""

L — Limitations
- Locators: only {{LOCATOR_STRATEGY}}, and only the elements listed above.
- No hard sleeps of any kind. Use auto-waiting or explicit waits.
- No hard-coded URLs, credentials, timeouts or expected texts. Everything comes from {{CONFIG_SOURCE}} (keys: {{CONFIG_KEYS}}).
- Credentials come only from {{CREDENTIAL_KEYS}}. If they are blank, skip the dependent tests.
- No static or global driver or page instances, console printing, or commented-out code.
- Page objects never assert. Tests assert.
- Never log passwords or tokens in report steps.
- Do not automate: {{OUT_OF_SCOPE}}.
- Pin exactly these versions:
"""
{{DEPENDENCY_VERSIONS}}
"""
- Additional rules (optional): {{ADDITIONAL_RULES}}

E — Examples
Good: a page method named after the user's intent, such as <submitForm>(<formData>), that fills the fields and clicks the submit control.
Bad: a test that calls the driver directly and clicks an element through a locator written inside the test.
Good: asserting with the tool's web-first or explicit-wait assertion that the error element contains the configured expected text.
Bad: sleeping for a fixed time, then reading text and comparing it with a string literal.
Style reference (optional):
"""
{{CODE_STYLE_EXAMPLE}}
"""

A — Action
1. Create the build file with the pinned dependencies and the reporting integration.
2. Create a config reader that also accepts command-line or environment overrides.
3. Create a custom unchecked framework exception.
4. Create the page object: private final locators, action methods, state getters, and try/catch that wraps timeout and tool exceptions.
5. Create a base test with suite, class and method setup and teardown, and a fresh isolated session per test.
6. Create a listener that attaches a screenshot and the URL to the report when a test fails.
7. Create test classes for the scenarios. Use a data provider for invalid input combinations.
8. Self-check: every scenario is automated, no rule in Limitations is broken, and every file compiles.

R — Result
Only these files, each preceded by its path:
"""
{{OUTPUT_FILES}}
"""
Then the run command and the report command. No other prose.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent locators, APIs, messages, URLs or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
- The output must be deterministic. Do not use random test data generators.
```
