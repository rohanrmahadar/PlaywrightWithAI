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
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Epic("VWO Login Dashboard")
@Feature("Invalid Login")
public class InvalidLoginTest extends BaseTest {

    @DataProvider(name = "invalidCredentials")
    public Object[][] invalidCredentials() {
        String unregistered = ConfigReader.get("unregistered.username");
        String invalidPassword = ConfigReader.get("invalid.password");
        String malformedEmail = ConfigReader.get("malformed.email");
        return new Object[][]{
                {"Unregistered email with invalid password", unregistered, invalidPassword},
                {"Empty email with non-empty password", "", invalidPassword},
                {"Unregistered email with empty password", unregistered, ""},
                {"Empty email and empty password", "", ""},
                {"Malformed email with non-empty password", malformedEmail, invalidPassword}
        };
    }

    @Test(priority = 1, dataProvider = "invalidCredentials", description = "Invalid credentials are rejected with an error message")
    @Story("Error Handling")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Invalid, empty or malformed credentials must keep the user on the login page and display the authentication error.")
    public void invalidLoginShowsError(String scenario, String email, String password) {
        loginPage.login(email, password);
        assertThat(loginPage.errorMessage()).hasText(ConfigReader.get("expected.auth.error"));
        assertThat(getPage()).hasURL(urlContaining(ConfigReader.get("login.url.fragment")));
        assertThat(loginPage.loginForm()).isVisible();
        Assert.assertEquals(loginPage.getErrorMessage(), ConfigReader.get("expected.auth.error"),
                "Unexpected error message for scenario: " + scenario);
    }

    @Test(priority = 2, description = "Registered email with wrong password is rejected")
    @Story("Error Handling")
    @Severity(SeverityLevel.BLOCKER)
    @Description("A registered email combined with a wrong password must not authenticate and must display the authentication error.")
    public void registeredEmailWithWrongPasswordShowsError() {
        requireValidCredentials();
        loginPage.login(ConfigReader.get("valid.username"), ConfigReader.get("invalid.password"));
        assertThat(loginPage.errorMessage()).hasText(ConfigReader.get("expected.auth.error"));
        assertThat(getPage()).hasURL(urlContaining(ConfigReader.get("login.url.fragment")));
    }
}
