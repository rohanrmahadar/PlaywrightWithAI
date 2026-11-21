# VWO Test Cases + Playwright (TypeScript) Project Prompt

RICE-POT prompt used to generate the test cases in `docs/` and the Playwright TypeScript project in this folder.

## R — ROLE
You are a Test architect with 10+ years of experience testing SaaS web
applications, specializing in experimentation / A/B testing platforms, web
security, and cross-browser UI testing. You are an expert in writing clear,
traceable, execution-ready manual test cases.

## I — INSTRUCTIONS
Create a comprehensive set of test cases for the VWO web application
(https://app.vwo.com, also reachable at https://app.wingify.com).
Cover these modules:
1. Login page (email/password login, "Remember me", Forgot Password,
   Sign in with Google / SSO, "Start a free trial" link)
2. Sign-up / free trial registration
3. Dashboard (after login): navigation, account switcher, user profile, logout
4. Creating a campaign / A/B test (create, name, add URL, add variation,
   set goals, start, pause, stop, delete)
5. Reports page for a campaign

For each module, write:
- Positive (happy path) test cases
- Negative test cases (invalid input, empty fields, wrong credentials)
- Boundary value and field validation cases
- UI/UX cases (layout, labels, error messages, responsiveness)
- Security cases (SQL injection, XSS, brute force / account lockout,
  session timeout, HTTPS, password masking)
- Cross-browser and cross-device cases (Chrome, Firefox, Safari, Edge;
  desktop, tablet, mobile)
- Performance cases (page load time, behavior under slow network)
- Accessibility cases (keyboard navigation, screen reader labels,
  colour contrast)

## C — CONTEXT
VWO (Visual Website Optimizer) is a conversion rate optimization platform
built by Wingify. Marketers and product teams use it to run A/B tests,
split URL tests, multivariate tests, heatmaps, session recordings and
surveys on their websites. app.vwo.com is the login portal and main web
app. Users are businesses on free trial or paid plans, and accounts can
have several users with different roles (Admin, Manager, Viewer).
The test cases will be used by a QA team for manual regression testing
before a release, and some will later be automated with Playwright with typescript. create  a new project.

## E — EXAMPLE
| TC_ID | Module | Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|---|---|
| TC_LOGIN_001 | Login | Valid login with registered email and password | User has an active VWO account | 1. Open https://app.vwo.com 2. Enter email 3. Enter password 4. Click "Sign in" | Email: testuser@example.com / Password: Test@1234 | User is redirected to the VWO dashboard and their name shows in the header | High | Positive |
| TC_LOGIN_002 | Login | Login with wrong password | User has an active account | 1. Open login page 2. Enter valid email 3. Enter wrong password 4. Click "Sign in" | Password: Wrong@123 | Error message "Your email, password, IP address or location did not match" is shown; user stays on login page | High | Negative |

## P — PARAMETERS
- At least 40 test cases in total, with at least 10 for the Login page
- Use TC_ID format: TC_<MODULE>_<3-digit number> (e.g., TC_LOGIN_001)
- Priority: High / Medium / Low
- Type: Positive / Negative / Boundary / UI / Security / Performance /
  Accessibility / Compatibility
- Test steps must be numbered and atomic (one action per step)
- Expected results must be specific and verifiable
- Include realistic test data (emails, passwords, URLs, campaign names)
- Mark which test cases are good candidates for automation

## O — OUTPUT
1. A markdown table per module with these columns:
   TC_ID | Module | Scenario | Pre-conditions | Test Steps | Test Data |
   Expected Result | Priority | Type | Automation Candidate (Y/N)
2. After the tables, a short summary showing:
   - Total test cases per module
   - Count by Priority and by Type
   - Top 10 test cases for a smoke test suite
3. Also give the full set as CSV I can import into Excel / Jira / TestRail.

## T — TONE
Professional, precise, and technical, as in formal QA documentation.
Use clear, unambiguous language that a junior tester can follow without
asking questions.
