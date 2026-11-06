package com.vwo.base;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.assertions.PlaywrightAssertions;
import com.vwo.exceptions.FrameworkException;
import com.vwo.pages.LoginPage;
import com.vwo.utils.ConfigReader;
import org.testng.SkipException;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Properties;
import java.util.regex.Pattern;

public abstract class BaseTest {

    private static final Pattern REGEX_METACHARACTERS = Pattern.compile("[\\\\^$.|?*+()\\[\\]{}]");

    private Playwright playwright;
    private Browser browser;
    private BrowserContext context;
    private Page page;
    protected LoginPage loginPage;

    @BeforeSuite(alwaysRun = true)
    public void verifyConfiguration() {
        ConfigReader.get("base.url");
        ConfigReader.get("browser");
        ConfigReader.getBoolean("headless");
        ConfigReader.getInt("default.timeout.ms");
    }

    @BeforeClass(alwaysRun = true)
    public void launchBrowser() {
        try {
            playwright = Playwright.create();
            BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
                    .setHeadless(ConfigReader.getBoolean("headless"));
            browser = resolveBrowserType(ConfigReader.get("browser")).launch(options);
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to launch browser: " + ConfigReader.get("browser"), e);
        }
    }

    @BeforeMethod(alwaysRun = true)
    public void openLoginPage() {
        try {
            int timeout = ConfigReader.getInt("default.timeout.ms");
            context = browser.newContext();
            context.setDefaultTimeout(timeout);
            context.setDefaultNavigationTimeout(timeout);
            PlaywrightAssertions.setDefaultAssertionTimeout(timeout);
            page = context.newPage();
            loginPage = new LoginPage(page);
            loginPage.navigateTo(ConfigReader.get("base.url"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to create browser context and open login page", e);
        }
    }

    @AfterMethod(alwaysRun = true)
    public void closeContext() {
        try {
            if (context != null) {
                context.close();
            }
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to close browser context", e);
        } finally {
            context = null;
            page = null;
            loginPage = null;
        }
    }

    @AfterClass(alwaysRun = true)
    public void closeBrowser() {
        try {
            if (browser != null) {
                browser.close();
            }
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to close browser", e);
        } finally {
            browser = null;
            if (playwright != null) {
                playwright.close();
                playwright = null;
            }
        }
    }

    @AfterSuite(alwaysRun = true)
    public void writeAllureEnvironment() {
        String resultsDirectory = System.getProperty("allure.results.directory", "target/allure-results");
        Path directory = Paths.get(resultsDirectory);
        Properties environment = new Properties();
        environment.setProperty("Base.URL", ConfigReader.get("base.url"));
        environment.setProperty("Browser", ConfigReader.get("browser"));
        environment.setProperty("Headless", ConfigReader.get("headless"));
        try {
            Files.createDirectories(directory);
            try (OutputStream stream = Files.newOutputStream(directory.resolve("environment.properties"))) {
                environment.store(stream, null);
            }
        } catch (IOException e) {
            throw new FrameworkException("Unable to write Allure environment file to " + directory, e);
        }
    }

    public Page getPage() {
        return page;
    }

    protected static Pattern urlContaining(String fragment) {
        return Pattern.compile(".*" + REGEX_METACHARACTERS.matcher(fragment).replaceAll("\\\\$0") + ".*");
    }

    protected void requireValidCredentials() {
        if (ConfigReader.isBlank("valid.username") || ConfigReader.isBlank("valid.password")) {
            throw new SkipException("Valid credentials not supplied. Pass -Dvalid.username and -Dvalid.password to run this test.");
        }
    }

    private BrowserType resolveBrowserType(String name) {
        switch (name.toLowerCase(Locale.ROOT)) {
            case "chromium":
                return playwright.chromium();
            case "firefox":
                return playwright.firefox();
            case "webkit":
                return playwright.webkit();
            default:
                throw new FrameworkException("Unsupported browser: " + name);
        }
    }
}
