package com.vwo.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.TimeoutError;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.vwo.exceptions.FrameworkException;
import io.qameta.allure.Step;

import java.util.function.Supplier;

public class LoginPage {

    private static final String NAVIGATION_TIMING_SCRIPT =
            "() => performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd";

    private final Page page;
    private final Locator loginForm;
    private final Locator emailInput;
    private final Locator passwordInput;
    private final Locator passwordVisibilityToggle;
    private final Locator signInButton;
    private final Locator rememberMeCheckbox;
    private final Locator rememberMeLabel;
    private final Locator forgotPasswordButton;
    private final Locator freeTrialLink;
    private final Locator errorMessage;
    private final Locator forgotPasswordEmailInput;

    public LoginPage(Page page) {
        this.page = page;
        this.loginForm = page.locator("xpath=//form[@id='js-login-form']");
        this.emailInput = page.locator("xpath=//input[@id='login-username']");
        this.passwordInput = page.locator("xpath=//input[@id='login-password']");
        this.passwordVisibilityToggle = page.locator(
                "xpath=//input[@id='login-password']/following-sibling::button[@aria-label='Toggle password visibility']");
        this.signInButton = page.locator("xpath=//button[@id='js-login-btn']");
        this.rememberMeCheckbox = page.locator("xpath=//input[@id='checkbox-remember']");
        this.rememberMeLabel = page.locator("xpath=//label[@for='checkbox-remember']");
        this.forgotPasswordButton = page.locator(
                "xpath=//form[@id='js-login-form']//button[normalize-space()='Forgot Password?']");
        this.freeTrialLink = page.locator(
                "xpath=//form[@id='js-login-form']//a[normalize-space()='Start a free trial']");
        this.errorMessage = page.locator("xpath=//div[@id='js-notification-box-msg']");
        this.forgotPasswordEmailInput = page.locator("xpath=//input[@id='forgot-password-username']");
    }

    @Step("Navigate to login page: {url}")
    public void navigateTo(String url) {
        perform("navigate to " + url, () -> {
            page.navigate(url);
            emailInput.waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.VISIBLE));
        });
    }

    @Step("Enter email address: {email}")
    public void enterUsername(String email) {
        perform("enter email address", () -> emailInput.fill(email));
    }

    @Step("Enter password")
    public void enterPassword(String password) {
        perform("enter password", () -> passwordInput.fill(password));
    }

    @Step("Click Sign in")
    public void clickLogin() {
        perform("click Sign in", signInButton::click);
    }

    @Step("Login with email: {email}")
    public void login(String email, String password) {
        enterUsername(email);
        enterPassword(password);
        clickLogin();
    }

    @Step("Check Remember me")
    public void checkRememberMe() {
        perform("check Remember me", () -> {
            if (!rememberMeCheckbox.isChecked()) {
                rememberMeLabel.click();
            }
        });
    }

    @Step("Uncheck Remember me")
    public void uncheckRememberMe() {
        perform("uncheck Remember me", () -> {
            if (rememberMeCheckbox.isChecked()) {
                rememberMeLabel.click();
            }
        });
    }

    @Step("Read Remember me state")
    public boolean isRememberMeChecked() {
        return fetch("read Remember me state", rememberMeCheckbox::isChecked);
    }

    @Step("Toggle password visibility")
    public void togglePasswordVisibility() {
        perform("toggle password visibility", passwordVisibilityToggle::click);
    }

    @Step("Click Forgot Password?")
    public void clickForgotPassword() {
        perform("click Forgot Password?", forgotPasswordButton::click);
    }

    @Step("Read error message")
    public String getErrorMessage() {
        return fetch("read error message", () -> {
            errorMessage.waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.VISIBLE));
            return errorMessage.innerText().trim();
        });
    }

    @Step("Read Start a free trial link target")
    public String getFreeTrialHref() {
        return fetch("read Start a free trial link target", () -> freeTrialLink.getAttribute("href"));
    }

    @Step("Wait for navigation away from {loginFragment}")
    public void waitForNavigationAwayFrom(String loginFragment) {
        perform("wait for navigation away from login", () -> page.waitForURL(url -> !url.contains(loginFragment)));
    }

    @Step("Measure DOMContentLoaded time")
    public long getDomContentLoadedMillis() {
        return fetch("measure DOMContentLoaded time", () -> {
            Object value = page.evaluate(NAVIGATION_TIMING_SCRIPT);
            if (!(value instanceof Number)) {
                throw new FrameworkException("Navigation timing is unavailable: " + value);
            }
            return ((Number) value).longValue();
        });
    }

    public Locator loginForm() {
        return loginForm;
    }

    public Locator emailInput() {
        return emailInput;
    }

    public Locator passwordInput() {
        return passwordInput;
    }

    public Locator rememberMeCheckbox() {
        return rememberMeCheckbox;
    }

    public Locator signInButton() {
        return signInButton;
    }

    public Locator freeTrialLink() {
        return freeTrialLink;
    }

    public Locator errorMessage() {
        return errorMessage;
    }

    public Locator forgotPasswordEmailInput() {
        return forgotPasswordEmailInput;
    }

    private void perform(String action, Runnable step) {
        try {
            step.run();
        } catch (TimeoutError e) {
            throw new FrameworkException("Timed out while trying to " + action, e);
        } catch (PlaywrightException e) {
            throw new FrameworkException("Failed to " + action, e);
        }
    }

    private <T> T fetch(String action, Supplier<T> query) {
        try {
            return query.get();
        } catch (TimeoutError e) {
            throw new FrameworkException("Timed out while trying to " + action, e);
        } catch (PlaywrightException e) {
            throw new FrameworkException("Failed to " + action, e);
        }
    }
}
