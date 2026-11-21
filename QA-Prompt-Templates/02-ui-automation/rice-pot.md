# UI Automation · RICE-POT

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `12` |
| `{{AUTOMATION_TOOL}}` | Yes | UI automation tool | `Playwright`, `Selenium WebDriver` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java`, `TypeScript`, `Python` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG`, `JUnit 5`, `pytest`, `@playwright/test` |
| `{{BUILD_TOOL}}` | Yes | Build or dependency tool | `Maven`, `Gradle`, `npm` |
| `{{REPORTING_TOOL}}` | Yes | Report library | `Allure`, `ExtentReports` |
| `{{PAGE_NAME}}` | Yes | Page or flow being automated | `Login`, `Checkout` |
| `{{APPLICATION_NAME}}` | Yes | Application under test | `Admin Console` |
| `{{LOCATOR_STRATEGY}}` | Yes | Allowed locator types, in order of preference | `data-testid, then id, then XPath` |
| `{{CONFIG_SOURCE}}` | Yes | Config file path, plus any override mechanism | `src/test/resources/config.properties, overridable with -D` |
| `{{CREDENTIAL_KEYS}}` | Yes | Names of the config keys or env vars holding credentials (never the values) | `valid.username, valid.password` |
| `{{ADDITIONAL_RULES}}` | Optional | Team-specific rules | `Use java.util.logging only` |
| `{{APPLICATION_URL}}` | Yes | URL of the page under test. The prompt tells the model to read it from config, not hard-code it | `https://<host>/<path>` |
| `{{ELEMENT_INVENTORY}}` | Yes | Elements and their locators, checked against the live DOM | `Email field: //input[@id='...']` |
| `{{PAGE_BEHAVIOUR}}` | Yes | Behaviour you observed on the real page (messages, redirects, defaults) | `Failed login shows "<message>"; URL unchanged` |
| `{{CONFIG_KEYS}}` | Yes | Config keys the framework must use | `base.url, browser, headless, default.timeout.ms` |
| `{{TEST_SCENARIOS}}` | Yes | Numbered list of scenarios to automate | `1. Valid login redirects away from the login page` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be automated | `SSO, MFA, CAPTCHA` |
| `{{CODE_STYLE_EXAMPLE}}` | Optional | A short snippet from your codebase that shows its style | a Page Object method |
| `{{LANGUAGE_VERSION}}` | Yes | Language or runtime version | `17`, `Node 20`, `3.12` |
| `{{DEPENDENCY_VERSIONS}}` | Yes | Exact versions to pin, one per line | `<tool> 1.x.y`, `<runner> 7.x.y` |
| `{{BROWSERS}}` | Yes | Browsers the suite must support | `chromium, firefox, webkit` |
| `{{BASE_PACKAGE}}` | Yes | Root package, module or folder name | `com.company.project` |
| `{{OUTPUT_FILES}}` | Yes | Files to generate, one per line, with paths | `pom.xml`, `src/main/java/.../LoginPage.java` |

## Prompt

```text
R — Role
You are a QA automation architect with {{ROLE_EXPERIENCE_YEARS}} years of experience in web application testing and enterprise test frameworks. You are an expert in {{AUTOMATION_TOOL}} with {{LANGUAGE}}, {{TEST_RUNNER}}, {{BUILD_TOOL}} and {{REPORTING_TOOL}}.

I — Instructions
- Generate a complete {{AUTOMATION_TOOL}} ({{LANGUAGE}}) automation framework for the {{PAGE_NAME}} page of {{APPLICATION_NAME}}, to enterprise standards.
- Automate exactly the scenarios listed in Context, with both valid and invalid cases.
[Mandatory] Use the {{TEST_RUNNER}} lifecycle hooks with proper setup and teardown:
  - Suite level: validate the configuration and fail fast if a required key is missing.
  - Class level: start the driver or browser once.
  - Method level: create a fresh, isolated session (context, page or driver) per test and open the page under test.
  - Close everything in reverse order of creation.
[Mandatory] Use the Page Object Model:
  - Declare locators as private, final fields and initialise them in one place.
  - Expose reusable, intention-revealing public action methods (for example <verbBusinessAction>(<inputs>) rather than clickButton1()).
  - Expose element or state getters so that tests make the assertions, not page objects.
[Mandatory] Use only these locator strategies, in this order of preference: {{LOCATOR_STRATEGY}}. Use only the locators given in Context.
[Mandatory] Add structured exception handling in page objects and the test base. Catch the tool's timeout exception first, then its general exception. Rethrow both wrapped in one custom unchecked framework exception with a clear message.
[Mandatory] Integrate {{REPORTING_TOOL}}: add test metadata (feature, story, severity, description) and step logging in page methods. On failure, attach a screenshot and the current URL. Never log a password or token value.
[Mandatory] Read all configuration and test data from {{CONFIG_SOURCE}}. Do not hard-code URLs, credentials, timeouts or expected texts in code.
[Mandatory] Read credentials only from these keys: {{CREDENTIAL_KEYS}}. If they are blank, skip the dependent tests instead of failing them.
[Mandatory] Use data-driven tests (the runner's data provider or parametrize feature) for invalid input combinations.
[Mandatory] Use the tool's web-first or explicit-wait assertions for UI state. Use the runner's plain assertions only for non-UI values.
[Don't] Do not use hard sleeps (Thread.sleep, time.sleep, waitForTimeout or equivalents). Rely on auto-waiting or explicit waits only.
[Don't] Do not use static or global driver, browser or page instances, console printing, or commented-out code.
[Don't] Do not add a locator, scenario or behaviour that is not listed in Context.
Additional rules (optional): {{ADDITIONAL_RULES}}
Keep the structure, naming and modularity consistent across all files.

C — Context
Application URL (read it from config, never hard-code it): {{APPLICATION_URL}}
Elements on the page, verified against the live DOM:
"""
{{ELEMENT_INVENTORY}}
"""
Behaviour observed on the live page:
"""
{{PAGE_BEHAVIOUR}}
"""
Configuration keys: {{CONFIG_KEYS}}
Scenarios to automate:
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
- Target {{LANGUAGE}} {{LANGUAGE_VERSION}}.
- Pin these exact dependency versions in the {{BUILD_TOOL}} build file:
"""
{{DEPENDENCY_VERSIONS}}
"""
- The browser is selected from config and supports: {{BROWSERS}}. Headless mode is configurable.
- Root package or folder: {{BASE_PACKAGE}}.
- The code must compile with zero warnings and run with one command.

O — Output
[Output] Provide only these files, each preceded by its file path:
"""
{{OUTPUT_FILES}}
"""
End with the command that runs the suite and the command that opens the report. No other explanation.

T — Tone
Technical, precise and enterprise-grade. Code only.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent locators, APIs, messages, URLs or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
- The output must be deterministic. Do not use random test data generators.
```
