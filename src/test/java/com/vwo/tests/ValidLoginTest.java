package com.vwo.tests;

import com.vwo.base.BaseTest;
import com.vwo.utils.ConfigReader;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Epic("VWO Login Dashboard")
@Feature("Valid Login and Login Page UI")
public class ValidLoginTest extends BaseTest {

    @Test(priority = 1, description = "Login with valid credentials navigates away from the login page")
    @Story("Primary Authentication")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Valid email and password must authenticate the user and leave the login route.")
    public void validLoginNavigatesAwayFromLoginPage() {
        requireValidCredentials();
        String loginFragment = ConfigReader.get("login.url.fragment");
        loginPage.login(ConfigReader.get("valid.username"), ConfigReader.get("valid.password"));
        loginPage.waitForNavigationAwayFrom(loginFragment);
        assertThat(getPage()).not().hasURL(urlContaining(loginFragment));
    }

    @Test(priority = 2, description = "Login with valid credentials and Remember me checked")
    @Story("Remember Me")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Remember me must be checked before submission and valid credentials must authenticate the user.")
    public void validLoginWithRememberMe() {
        requireValidCredentials();
        String loginFragment = ConfigReader.get("login.url.fragment");
        loginPage.checkRememberMe();
        assertThat(loginPage.rememberMeCheckbox()).isChecked();
        loginPage.login(ConfigReader.get("valid.username"), ConfigReader.get("valid.password"));
        loginPage.waitForNavigationAwayFrom(loginFragment);
        assertThat(getPage()).not().hasURL(urlContaining(loginFragment));
    }

    @Test(priority = 3, description = "Remember me checkbox can be checked and unchecked")
    @Story("Remember Me")
    @Severity(SeverityLevel.NORMAL)
    @Description("Remember me is unchecked by default and toggles through its clickable label.")
    public void rememberMeCheckboxToggles() {
        assertThat(loginPage.rememberMeCheckbox()).not().isChecked();
        loginPage.checkRememberMe();
        assertThat(loginPage.rememberMeCheckbox()).isChecked();
        loginPage.uncheckRememberMe();
        assertThat(loginPage.rememberMeCheckbox()).not().isChecked();
        Assert.assertFalse(loginPage.isRememberMeChecked(), "Remember me should be unchecked after second toggle");
    }

    @Test(priority = 4, description = "Email field receives focus automatically on page load")
    @Story("Auto-focus")
    @Severity(SeverityLevel.MINOR)
    @Description("The first input field must be focused automatically to reduce user interactions.")
    public void emailFieldIsAutoFocused() {
        assertThat(loginPage.emailInput()).isFocused();
    }

    @Test(priority = 5, description = "Password is masked and can be revealed with the visibility toggle")
    @Story("Password Field")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Password input is masked by default and the visibility toggle switches it to plain text.")
    public void passwordIsMaskedAndToggles() {
        loginPage.enterPassword(ConfigReader.get("invalid.password"));
        assertThat(loginPage.passwordInput()).hasAttribute("type", "password");
        loginPage.togglePasswordVisibility();
        assertThat(loginPage.passwordInput()).hasAttribute("type", "text");
        loginPage.togglePasswordVisibility();
        assertThat(loginPage.passwordInput()).hasAttribute("type", "password");
    }

    @Test(priority = 6, description = "Forgot Password? opens the password reset view")
    @Story("Forgot Password Flow")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Forgot Password? must route to the forgot password view with an email input.")
    public void forgotPasswordOpensResetView() {
        loginPage.clickForgotPassword();
        assertThat(getPage()).hasURL(urlContaining(ConfigReader.get("forgot.password.url.fragment")));
        assertThat(loginPage.forgotPasswordEmailInput()).isVisible();
    }

    @Test(priority = 7, description = "Start a free trial link is displayed and points to the free trial page")
    @Story("Account Registration Link")
    @Severity(SeverityLevel.NORMAL)
    @Description("The registration link must be visible on the login page and target the free trial signup path.")
    public void freeTrialLinkIsPresent() {
        assertThat(loginPage.freeTrialLink()).isVisible();
        String href = loginPage.getFreeTrialHref();
        Assert.assertNotNull(href, "Start a free trial link has no href");
        Assert.assertTrue(href.contains(ConfigReader.get("free.trial.href.fragment")),
                "Unexpected free trial link target: " + href);
    }

    @Test(priority = 8, description = "Login page DOM loads within the PRD threshold")
    @Story("Page Load Speed")
    @Severity(SeverityLevel.NORMAL)
    @Description("PRD requires the login page to load within 2 seconds on standard connections.")
    public void loginPageLoadsWithinThreshold() {
        long threshold = ConfigReader.getInt("page.load.threshold.ms");
        long actual = loginPage.getDomContentLoadedMillis();
        Assert.assertTrue(actual <= threshold,
                "DOMContentLoaded took " + actual + " ms, exceeding threshold of " + threshold + " ms");
    }
}
