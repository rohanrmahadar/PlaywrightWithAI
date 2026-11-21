# VWO Login - Test Cases (Anti-Hallucination Run)

Prompt: [`prompts/vwo-anti-hallucination-prompt.md`](../prompts/vwo-anti-hallucination-prompt.md)
Run date: 2026-11-22

**Input status:** The INPUT MATERIAL section of the prompt was submitted with its template placeholders unfilled. No PRD, API documentation, screenshots, logs, test data or observed behaviour was provided. Under anti-hallucination rule 1, the only usable source is the prompt text itself ("User input"). Facts about the live site that were observed in an earlier, separate session were deliberately **not** used.

Source labels used below:
- **User input - I**: the prompt's I - INSTRUCTIONS section
- **User input - C**: the prompt's C - CONTEXT section

---

## 1. Verified Facts

1. The application under test is the VWO web application. *Source: User input - I, User input - C*
2. VWO is an experimentation / conversion-optimisation platform by Wingify. *Source: User input - C*
3. The entry point is https://app.vwo.com, described as the "login portal". *Source: User input - C*
4. The application is also reachable at https://app.wingify.com. *Source: User input - I*
5. The application has a Login page; test design starts with it. *Source: User input - I*
6. The test cases are for a QA team doing manual regression testing; some will later be automated. *Source: User input - C*
7. Every INPUT MATERIAL item (PRD / requirements, API documentation, Screenshots, Logs, Test data, Observed behaviour) is an unfilled placeholder; none was provided. *Source: User input - C*

Not treated as facts: the field labels "Email" and "Password", the "Sign in" button, the value "Wrong@123" and "Screenshot 3" appear only in the E - EXAMPLE section. That section says it is "illustrative only. Do not reuse its content unless the input supports it", and no input supports it.

## 2. Missing / Unknown Information

| # | Gap | Question needed to close it |
|---|---|---|
| 1 | Fields on the Login page and their exact labels | Which input fields does the Login page show, and what is the exact label of each (screenshot)? |
| 2 | Buttons and links on the Login page | Which buttons and links are present (e.g., submit, password reset, single sign-on, sign-up), with their exact text? |
| 3 | Valid test account | Which email/password (or other credentials) may be used for a successful login? |
| 4 | Post-login destination | Which page is shown after a successful login, and how is it identified (URL, heading, screenshot)? |
| 5 | Error messages | What exact text is shown for wrong password, unregistered email, empty fields and malformed email? Is it the same message for all of them? |
| 6 | Client-side validation | Is the email format validated before submission? Are there field-level messages? |
| 7 | Field limits | What are the minimum/maximum lengths for each field? |
| 8 | Password rules | What password policy applies (length, character classes)? |
| 9 | Brute force / lockout policy | After how many failed attempts, if any, is an account or IP throttled or locked, for how long, and what is shown? |
| 10 | Session timeout | Does an idle session expire? After how long, and what does the user see? |
| 11 | "Remember me" / persistent session | Does a persistent-login option exist, and how should it behave? |
| 12 | SSO / third-party sign-in | Are SSO or other identity-provider logins supported? What is the expected flow? |
| 13 | Multi-factor authentication | Is a second factor (e.g., emailed code, authenticator) required in any case? |
| 14 | Password reset | Does a password-reset flow exist? What are its screens, messages and email behaviour? |
| 15 | HTTP to HTTPS behaviour | Should http://app.vwo.com redirect to HTTPS? |
| 16 | Relationship between the two URLs | Does https://app.wingify.com redirect to https://app.vwo.com, or serve the same Login page directly? |
| 17 | Logout | How does a user log out, and where are they taken afterwards? |
| 18 | Access control | What should happen when a protected URL is opened without a session? Which URL is protected? |
| 19 | Supported browsers and devices | Which browsers (and versions) and device classes are in scope for compatibility testing? |
| 20 | Accessibility target | Which conformance level applies (e.g., a WCAG version and level)? Which assistive technologies are in scope? |
| 21 | Authentication API | Which endpoint(s), methods, request/response formats and status codes does login use? |
| 22 | User roles | Which user roles exist, and do they change login or post-login behaviour? |
| 23 | Other screens | Which screens besides Login are in scope (instruction I refers to "any other screens shown in the INPUT MATERIAL", but none were shown)? |

## 3. Generated Output

Only the scenarios that Facts 3, 4 and 5 support could be generated. No test can be written for credentials, fields, messages, validation, boundaries, lockout, session handling, browsers or accessibility: Gaps 1-23 make each of those "Insufficient information to determine."

### Login

| TC_ID | Module | Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Source | Priority | Type | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|
| TC_LOGIN_001 | Login | Open the login portal via the primary entry point | Insufficient information to determine. | 1. Open a web browser<br>2. Enter https://app.vwo.com in the address bar<br>3. Press Enter | URL: https://app.vwo.com | The VWO login portal (Login page) is displayed. Exact page content: Insufficient information to determine. | User input - C (Fact 3), User input - I (Fact 5) | High | Positive | Verified |
| TC_LOGIN_002 | Login | Open the application via the alternate URL | Insufficient information to determine. | 1. Open a web browser<br>2. Enter https://app.wingify.com in the address bar<br>3. Press Enter | URL: https://app.wingify.com | The VWO web application is reached. Whether it redirects to https://app.vwo.com, and which screen is shown: Insufficient information to determine. | User input - I (Fact 4) | Medium | Positive | Verified |
| TC_LOGIN_003 | Login | Login portal is served over HTTPS | Insufficient information to determine. | 1. Open a web browser<br>2. Enter https://app.vwo.com in the address bar<br>3. Press Enter<br>4. Check the protocol shown in the address bar | URL: https://app.vwo.com | The page loads over HTTPS without a browser certificate warning. | User input - C (Fact 3: the entry point is given as an https:// URL) | Medium | Security | Inference (low confidence) |

### Coverage by required type

| Type | Generated | Reason |
|---|---|---|
| Positive | TC_LOGIN_001, TC_LOGIN_002 | Facts 3, 4, 5 |
| Negative | None | Insufficient information to determine. (Gaps 3, 5) |
| Boundary / Validation | None | Insufficient information to determine. (Gaps 6, 7, 8) |
| UI | None | Insufficient information to determine. (Gaps 1, 2) |
| Security | TC_LOGIN_003 | Fact 3; lockout, session and redirect tests blocked by Gaps 9, 10, 15 |
| Compatibility | None | Insufficient information to determine. (Gap 19) |
| Accessibility | None | Insufficient information to determine. (Gap 20) |

### CSV

The same rows are in [`VWO_Test_Cases.csv`](VWO_Test_Cases.csv):

```csv
"TC_ID","Module","Scenario","Pre-conditions","Test Steps","Test Data","Expected Result","Source","Priority","Type","Confidence"
"TC_LOGIN_001","Login","Open the login portal via the primary entry point","Insufficient information to determine.","1. Open a web browser
2. Enter https://app.vwo.com in the address bar
3. Press Enter","URL: https://app.vwo.com","The VWO login portal (Login page) is displayed. Exact page content: Insufficient information to determine.","User input - C (Fact 3), User input - I (Fact 5)","High","Positive","Verified"
"TC_LOGIN_002","Login","Open the application via the alternate URL","Insufficient information to determine.","1. Open a web browser
2. Enter https://app.wingify.com in the address bar
3. Press Enter","URL: https://app.wingify.com","The VWO web application is reached. Whether it redirects to https://app.vwo.com, and which screen is shown: Insufficient information to determine.","User input - I (Fact 4)","Medium","Positive","Verified"
"TC_LOGIN_003","Login","Login portal is served over HTTPS","Insufficient information to determine.","1. Open a web browser
2. Enter https://app.vwo.com in the address bar
3. Press Enter
4. Check the protocol shown in the address bar","URL: https://app.vwo.com","The page loads over HTTPS without a browser certificate warning.","User input - C (Fact 3: the entry point is given as an https:// URL)","Medium","Security","Inference (low confidence)"
```

## 4. Self-Validation Check

- **Count:** 3 test cases: 2 Verified, 1 Inference (low confidence).
- **No invention:** Every step and expected result traces to Facts 3-5 from the prompt text. No feature, UI element, label, error message, field limit, user role, API or behaviour was invented. Where a detail was needed but not given, the cell reads "Insufficient information to determine."
- **TC_LOGIN_003:** Labelled Inference (low confidence). The input gives the entry point as an https:// URL but does not state that a valid certificate is served or that HTTPS is a requirement.
- **Contradictions found in the input, and how they were handled:**
  1. Instruction I asks for tests of "any other screens shown in the INPUT MATERIAL", and Step 3 asks for coverage of seven test types. But the INPUT MATERIAL is empty. *Handled:* Step 3 was completed only as far as the facts allow; the coverage table records each type that could not be generated and why (per "If you cannot complete a step, stop and report why").
  2. The E - EXAMPLE uses specific labels ("Email", "Password", "Sign in") and test data ("Wrong@123"). *Handled:* not reused, as the example itself instructs.
  3. Context says the entry point is the "login portal", while Instruction I says the app is "also reachable at" https://app.wingify.com without saying what that URL shows. *Handled:* TC_LOGIN_002 asserts only that the application is reached; the screen and redirect are marked "Insufficient information to determine."
- **Determinism:** The cases are ordered by the fact they derive from (Fact 3, Fact 4, then the inferred security check). The same input produces the same three cases in the same order.

**To get a fuller set:** fill the INPUT MATERIAL in the prompt (screenshots of the Login page, a test account, and observed error text at minimum) and run it again. Most of Gaps 1-23 would then close.
