R — Role
You are a QA automation architect with 15 years of experience in web application testing, authentication flows and enterprise test frameworks. You are an expert in Playwright for Java, TestNG, Maven and Allure reporting, and you understand the VWO (Visual Website Optimizer) platform described in the attached PRD.

I — Instructions
- Generate a complete Playwright (Java) automation framework that meets enterprise-level standards.
- Automate and verify the VWO login page at https://app.vwo.com/#/login. Test the UI thoroughly with both valid and invalid test cases.
[Critical] Use TestNG annotations @BeforeSuite, @BeforeClass, @BeforeMethod, @Test, @AfterMethod, @AfterClass and @AfterSuite with proper setup and teardown logic:
  - @BeforeSuite validates the configuration.
  - Create Playwright and Browser once per class.
  - Create a new BrowserContext and Page for each test method, then open the login page.
  - Close the context after each test, and close the browser and Playwright after each class.
  - @AfterSuite writes an Allure environment.properties file.
[Critical] Add robust exception handling to both the Page Object and the test base. Use structured try-catch blocks that catch TimeoutError first, then PlaywrightException, and rethrow them wrapped in a custom unchecked FrameworkException with a clear message.
[Mandatory] Use the Page Object Model:
  - Declare private final Locator fields.
  - Initialise every Locator in the constructor with page.locator("xpath=...").
  - Expose reusable public action methods: navigateTo, enterUsername, enterPassword, clickLogin, login, checkRememberMe, uncheckRememberMe, isRememberMeChecked, togglePasswordVisibility, clickForgotPassword, getErrorMessage, getFreeTrialHref, waitForNavigationAwayFrom and getDomContentLoadedMillis.
  - Expose Locator getters so tests can assert with assertThat.
[Mandatory] Use XPath locators ONLY, in the form page.locator("xpath=//..."). Attribute predicates inside XPath (for example //input[@id='login-username']) are allowed.
[Mandatory] Integrate Allure reporting with TestNG (allure-testng):
  - Annotate tests with @Epic, @Feature, @Story, @Severity and @Description.
  - Annotate page methods with @Step. Never include the password value in a step name.
  - Add an ITestListener, registered in testng.xml, that attaches a full-page screenshot and the current URL to Allure when a test fails.
  - Run the AspectJ weaver as a surefire -javaagent.
  - Configure the allure-maven plugin.
  - Compile with -parameters so @Step placeholders resolve.
[Mandatory] Read all configuration and test data from src/test/resources/config.properties, and allow every key to be overridden with -D system properties. Do not hardcode credentials or expected texts anywhere in Java code.
[Mandatory] If valid.username or valid.password is blank, tests that need a real account must throw TestNG SkipException instead of failing.
[Mandatory] Write assertions with PlaywrightAssertions.assertThat (isVisible, isChecked, isFocused, hasText, hasAttribute, and hasURL on the page). Use TestNG Assert only for non-UI values.
[Mandatory] URL regex patterns are evaluated by the browser's JavaScript engine. Do NOT use Pattern.quote (\Q...\E). Escape regex metacharacters manually in a shared helper inside BaseTest.
[Mandatory] Provide invalid test data through a TestNG @DataProvider.
[Output] Output only runnable code. Do not include explanations, comments or extra text.
[Don't] Do not use CSS selectors, getByRole, getByText, getByLabel, getByPlaceholder, getByTestId, or text= / id= selector engines.
[Don't] Do not add comments, System.out.println, static browser or page globals, or any other bad coding practice. Use java.util.logging for non-fatal listener errors.
[DoNOTuse] Do not use Thread.sleep() or page.waitForTimeout() anywhere. Rely on Playwright's built-in auto-waiting, assertThat timeouts, page.waitForURL and locator.waitFor.
[Generate] Generate exactly 2 test scripts: ValidLoginTest and InvalidLoginTest.
Keep the structure, naming, readability and modularity consistent across all files.

C — Context
Elements on the login page, verified against the live DOM:
- Login form: //form[@id='js-login-form']
- Email field: //input[@id='login-username'] (type=email, auto-focused on load)
- Password field: //input[@id='login-password'] (type=password)
- Password visibility toggle: //input[@id='login-password']/following-sibling::button[@aria-label='Toggle password visibility']
- Sign in button: //button[@id='js-login-btn']
- Remember me checkbox: //input[@id='checkbox-remember']. It is visually hidden and unchecked by default; toggle it through its label.
- Remember me label: //label[@for='checkbox-remember']
- Forgot Password? button: //form[@id='js-login-form']//button[normalize-space()='Forgot Password?']
- Start a free trial link: //form[@id='js-login-form']//a[normalize-space()='Start a free trial'] (href contains "/free-trial/")
- Error message: //div[@id='js-notification-box-msg']
- Forgot password email field: //input[@id='forgot-password-username']

Behavior observed on the live page:
- Every failed login (wrong credentials, empty fields, malformed email) shows exactly this message: "Your email, password, IP address or location did not match". The URL stays on #/login.
- No client-side "Invalid email" message is shown, either on blur or on submit.
- Forgot Password? routes to #/forgot-password.
- The password toggle switches the field's type from "password" to "text".

config.properties keys: base.url, browser (chromium | firefox | webkit), headless, default.timeout.ms=15000, page.load.threshold.ms=2000, valid.username (blank), valid.password (blank), unregistered.username, invalid.password, malformed.email=abc@, expected.auth.error, login.url.fragment=#/login, forgot.password.url.fragment=#/forgot-password, free.trial.href.fragment=/free-trial/.

ValidLoginTest:
1. Valid credentials: after submitting, the URL no longer contains #/login. Skip if no credentials are supplied.
2. Valid credentials with Remember me checked: verify the checkbox is checked before submitting, then that login succeeds. Skip if no credentials are supplied.
3. Remember me is unchecked by default, and can be checked and then unchecked.
4. The email field is focused on page load.
5. The password is masked; the toggle reveals it, and toggling again masks it.
6. Forgot Password? routes to #/forgot-password and the forgot password email field is visible.
7. Start a free trial is visible and its href contains /free-trial/.
8. DOMContentLoaded (from navigation timing) is at most page.load.threshold.ms, per the PRD's 2-second requirement.

InvalidLoginTest (@DataProvider rows: scenario, email, password):
1. Unregistered email with an invalid password.
2. Empty email with a non-empty password.
3. Unregistered email with an empty password.
4. Empty email and empty password.
5. Malformed email with a non-empty password.
For every row, assert that the error message equals expected.auth.error, the URL contains #/login, and the login form is still visible.
Separate test: a registered email with a wrong password shows the same error. Skip if no credentials are supplied.

Out of scope: Google sign-in, SSO, Passkey, MFA/OTP screens and the post-login dashboard content.

E — Example
public class LoginPage {
    private final Page page;
    private final Locator emailInput;
    private final Locator passwordInput;
    private final Locator signInButton;

    public LoginPage(Page page) {
        this.page = page;
        this.emailInput = page.locator("xpath=//input[@id='login-username']");
        this.passwordInput = page.locator("xpath=//input[@id='login-password']");
        this.signInButton = page.locator("xpath=//button[@id='js-login-btn']");
    }

    @Step("Login with email: {email}")
    public void login(String email, String password) {
        try {
            emailInput.fill(email);
            passwordInput.fill(password);
            signInButton.click();
        } catch (TimeoutError e) {
            throw new FrameworkException("Timed out during login", e);
        } catch (PlaywrightException e) {
            throw new FrameworkException("Login action failed", e);
        }
    }
}

P — Parameters
Write production-level automation code with pinpoint accuracy and almost no bad coding practice. Target Java 17 (maven.compiler.release=17), pin these dependency versions in pom.xml, and compile with -Xlint:all and zero warnings:
- Playwright 1.49.0
- TestNG 7.10.2
- allure-testng 2.29.0
- aspectjweaver 1.9.22.1
- maven-compiler-plugin 3.13.0
- maven-surefire-plugin 3.5.2
- allure-maven 2.12.0

O — Output
Provide only these files, each preceded by its file path:
1. pom.xml
2. src/test/resources/testng.xml
3. src/test/resources/config.properties
4. src/main/java/com/vwo/exceptions/FrameworkException.java
5. src/main/java/com/vwo/utils/ConfigReader.java
6. src/main/java/com/vwo/pages/LoginPage.java (the single Page Object file)
7. src/test/java/com/vwo/base/BaseTest.java
8. src/test/java/com/vwo/listeners/AllureListener.java
9. src/test/java/com/vwo/tests/ValidLoginTest.java
10. src/test/java/com/vwo/tests/InvalidLoginTest.java
No explanations or additional content.

T — Tone
Technical, precise, enterprise-grade, code only.

## Safety Rules, Guardrails, Anti-Hallucination Rules
- Output must be deterministic (same input → same output). Do not use random data generators.
- Every assertion must be traceable to an input provided in this prompt or the attached PRD.
- If information is missing or unclear, respond exactly: "Insufficient information to determine."
- If a detail is inferred, label it exactly: "Inference (low confidence)".
- Do not invent features, IDs, APIs, error codes, UI elements or behavior beyond what is listed in Context.
- Do not assume default or "typical" system behavior.
