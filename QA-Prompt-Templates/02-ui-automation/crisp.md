# UI Automation · CRISP

Use this version to add a page and its tests to an existing framework.

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
| `{{REPORTING_TOOL}}` | Yes | Report library | `Allure`, `ExtentReports` |
| `{{BASE_PACKAGE}}` | Yes | Root package, module or folder name | `com.company.project` |
| `{{EXISTING_CODE}}` | Yes | Existing scripts or framework classes to build on or refactor | pasted code |
| `{{PAGE_NAME}}` | Yes | Page or flow being automated | `Login`, `Checkout` |
| `{{APPLICATION_URL}}` | Yes | URL of the page under test. The prompt tells the model to read it from config, not hard-code it | `https://<host>/<path>` |
| `{{CONFIG_SOURCE}}` | Yes | Config file path, plus any override mechanism | `src/test/resources/config.properties, overridable with -D` |
| `{{ELEMENT_INVENTORY}}` | Yes | Elements and their locators, checked against the live DOM | `Email field: //input[@id='...']` |
| `{{PAGE_BEHAVIOUR}}` | Yes | Behaviour you observed on the real page (messages, redirects, defaults) | `Failed login shows "<message>"; URL unchanged` |
| `{{ROLE_EXPERIENCE_YEARS}}` | Yes | Seniority of the persona | `12` |
| `{{LOCATOR_STRATEGY}}` | Yes | Allowed locator types, in order of preference | `data-testid, then id, then XPath` |
| `{{TEST_SCENARIOS}}` | Yes | Numbered list of scenarios to automate | `1. Valid login redirects away from the login page` |
| `{{OUT_OF_SCOPE}}` | Yes | What must not be automated | `SSO, MFA, CAPTCHA` |

## Prompt

```text
C — Context
Existing framework: {{AUTOMATION_TOOL}}, {{LANGUAGE}} {{LANGUAGE_VERSION}}, {{TEST_RUNNER}}, {{REPORTING_TOOL}}. Root package: {{BASE_PACKAGE}}.
Relevant existing code (base test, an existing page object, config reader):
"""
{{EXISTING_CODE}}
"""
New page: {{PAGE_NAME}}, at {{APPLICATION_URL}} (the URL comes from {{CONFIG_SOURCE}}).
Elements:
"""
{{ELEMENT_INVENTORY}}
"""
Observed behaviour:
"""
{{PAGE_BEHAVIOUR}}
"""

R — Role
Act as a senior automation engineer with {{ROLE_EXPERIENCE_YEARS}} years of experience with {{AUTOMATION_TOOL}}.

I — Instructions
1. Create a page object for {{PAGE_NAME}} that follows the existing code's patterns exactly (naming, exception handling, reporting steps).
2. Use only {{LOCATOR_STRATEGY}} locators from the element list.
3. Write tests for these scenarios, extending the existing base test:
"""
{{TEST_SCENARIOS}}
"""
4. Add any new config keys to {{CONFIG_SOURCE}}. Do not hard-code data.
5. Use auto-waiting or explicit waits only. Never use hard sleeps.

S — Scope
In scope: the new page object, its tests, and new config keys.
Out of scope: changes to existing classes (unless a change is unavoidable; then explain it in one line), and {{OUT_OF_SCOPE}}.

P — Presentation
Each new or changed file, preceded by its path. For a changed file, show only the changed methods or keys. No other prose.

Guardrails
- Use only the information in this prompt and its attachments. Do not invent locators, APIs, messages, URLs or behaviour.
- If something needed is missing, write "Insufficient information to determine: <what is missing>" and continue with the rest.
- Label anything you infer as "Inference (low confidence)".
- Do not assume default or "typical" system behaviour.
- Never output real credentials, tokens or personal data.
```
