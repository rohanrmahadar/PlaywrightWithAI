# UI Automation · STAR

Use this version to refactor or migrate existing scripts into a clean Page Object Model.

## How to use

1. Copy the prompt from the code block under **Prompt**.
2. Replace each `{{PLACEHOLDER}}` (braces included) with your value. The table below explains each one.
3. If you don't need an **Optional** placeholder, delete it together with its "optional" label. If it sits in its own `"""` block, delete the block and the label line above it.
4. Make sure no `{{` is left, then paste the prompt into your LLM along with any attachments it mentions.
5. Never put real passwords, tokens or customer data in a placeholder. Give the config key or environment variable name instead.

## Placeholders

| Placeholder | Required | Meaning | Example |
|-------------|----------|---------|---------|
| `{{PAGE_NAME}}` | Yes | Page or flow being automated | `Login`, `Checkout` |
| `{{APPLICATION_NAME}}` | Yes | Application under test | `Admin Console` |
| `{{AUTOMATION_TOOL}}` | Yes | UI automation tool | `Playwright`, `Selenium WebDriver` |
| `{{LANGUAGE}}` | Yes | Programming language | `Java`, `TypeScript`, `Python` |
| `{{TEST_RUNNER}}` | Yes | Test framework | `TestNG`, `JUnit 5`, `pytest`, `@playwright/test` |
| `{{EXISTING_CODE}}` | Yes | Existing scripts or framework classes to build on or refactor | pasted code |
| `{{ELEMENT_INVENTORY}}` | Yes | Elements and their locators, checked against the live DOM | `Email field: //input[@id='...']` |
| `{{PAGE_BEHAVIOUR}}` | Yes | Behaviour you observed on the real page (messages, redirects, defaults) | `Failed login shows "<message>"; URL unchanged` |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `12` |
| `{{REPORTING_TOOL}}` | Yes | Report library | `Allure`, `ExtentReports` |
| `{{TEST_SCENARIOS}}` | Yes | Numbered list of scenarios to automate | `1. Valid login redirects away from the login page` |
| `{{LOCATOR_STRATEGY}}` | Yes | Allowed locator types, in order of preference | `data-testid, then id, then XPath` |
| `{{CONFIG_SOURCE}}` | Yes | Config file path, plus any override mechanism | `src/test/resources/config.properties, overridable with -D` |
| `{{CONFIG_KEYS}}` | Yes | Config keys the framework must use | `base.url, browser, headless, default.timeout.ms` |
| `{{CREDENTIAL_KEYS}}` | Yes | Names of the config keys or env vars holding credentials (never the values) | `valid.username, valid.password` |
| `{{BUILD_TOOL}}` | Yes | Build or dependency tool | `Maven`, `Gradle`, `npm` |
| `{{DEPENDENCY_VERSIONS}}` | Yes | Exact versions to pin, one per line | `<tool> 1.x.y`, `<runner> 7.x.y` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be automated | `SSO, MFA, CAPTCHA` |
| `{{OUTPUT_FILES}}` | Yes | Files to generate, one per line, with paths | `pom.xml`, `src/main/java/.../LoginPage.java` |

## Prompt

```text
S — Situation
Our UI tests for the {{PAGE_NAME}} page of {{APPLICATION_NAME}} are written with {{AUTOMATION_TOOL}} in {{LANGUAGE}}, using {{TEST_RUNNER}}. They are hard to maintain: locators and data are mixed into the tests, waits are unreliable, and failures are hard to diagnose. The current code:
"""
{{EXISTING_CODE}}
"""
Elements, verified against the live DOM:
"""
{{ELEMENT_INVENTORY}}
"""
Observed page behaviour:
"""
{{PAGE_BEHAVIOUR}}
"""

T — Task
Act as a QA automation architect with {{ROLE_EXPERIENCE_YEARS}} years of experience. Refactor this code into a maintainable Page Object Model framework. It must keep the same test coverage, add the scenarios below, and integrate {{REPORTING_TOOL}}.
Scenarios that must exist after the refactor:
"""
{{TEST_SCENARIOS}}
"""

A — Action
1. List each problem in the current code: hard-coded data, hard sleeps, duplicated steps, assertions inside page code, global state, missing teardown.
2. Move the locators into a page object, using only {{LOCATOR_STRATEGY}}.
3. Move URLs, credentials, timeouts and expected texts into {{CONFIG_SOURCE}} (keys: {{CONFIG_KEYS}}; credentials only in {{CREDENTIAL_KEYS}}).
4. Replace hard sleeps with auto-waiting or explicit waits.
5. Add a base test with suite, class and method setup and teardown, and a fresh isolated session per test.
6. Wrap the tool's exceptions in a custom unchecked framework exception.
7. Add a failure listener that attaches a screenshot and the URL to {{REPORTING_TOOL}}.
8. Turn repeated invalid-input tests into one data-driven test.
9. Pin these dependency versions in the {{BUILD_TOOL}} build file:
"""
{{DEPENDENCY_VERSIONS}}
"""
Do not automate: {{OUT_OF_SCOPE}}.

R — Result
1. A problems table: issue, where it was, how it was fixed.
2. The refactored files, each preceded by its path:
"""
{{OUTPUT_FILES}}
"""
3. A mapping from each old test to its new test, showing that no coverage was lost.
4. The run command.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent locators, APIs, messages, URLs or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
