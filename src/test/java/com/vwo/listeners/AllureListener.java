package com.vwo.listeners;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;
import com.vwo.base.BaseTest;
import io.qameta.allure.Allure;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.ByteArrayInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

public class AllureListener implements ITestListener {

    private static final Logger LOGGER = Logger.getLogger(AllureListener.class.getName());

    @Override
    public void onTestFailure(ITestResult result) {
        Object instance = result.getInstance();
        if (!(instance instanceof BaseTest)) {
            return;
        }
        Page page = ((BaseTest) instance).getPage();
        if (page == null || page.isClosed()) {
            return;
        }
        try {
            byte[] screenshot = page.screenshot(new Page.ScreenshotOptions().setFullPage(true));
            Allure.addAttachment(result.getMethod().getMethodName() + " - failure screenshot",
                    "image/png", new ByteArrayInputStream(screenshot), "png");
            Allure.addAttachment("Page URL at failure", "text/plain", page.url());
        } catch (PlaywrightException e) {
            LOGGER.log(Level.WARNING, "Unable to capture failure screenshot for " + result.getName(), e);
        }
    }
}
