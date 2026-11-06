# VWO Login Automation

Playwright (Java) + TestNG + Allure framework for the VWO login page at https://app.vwo.com/#/login.

- Page Object Model with XPath-only locators: `src/main/java/com/vwo/pages/LoginPage.java`
- Tests: `ValidLoginTest` (valid login, Remember me, auto-focus, password masking, Forgot Password, free trial link, page load time) and `InvalidLoginTest` (data-driven invalid credentials)
- Prompt used to generate the framework: [`prompts/vwo-playwright-prompt.md`](prompts/vwo-playwright-prompt.md)

## Requirements

- JDK 17 (`JAVA_HOME` set)
- Maven 3.8+

## Run

```
mvn clean test -Dvalid.username=you@company.com -Dvalid.password=yourPassword
mvn allure:serve
```

Without `valid.username` / `valid.password`, tests that need a real account are skipped. Every key in `src/test/resources/config.properties` can be overridden with `-D`, for example `-Dbrowser=firefox -Dheadless=false -Dpage.load.threshold.ms=3000`.

Never commit real credentials to `config.properties`.
