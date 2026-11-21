import AxeBuilder from '@axe-core/playwright';
import { expect, requireCredentials, test } from '../src/fixtures';
import { env } from '../src/config/env';
import { LoginPage } from '../src/pages/LoginPage';
import { boundary, payloads, slow3G, urlPatterns, viewports } from '../src/data/testData';

test.describe('Login page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test.describe('Positive', () => {
    test('TC_LOGIN_001 valid login redirects to the dashboard', { tag: ['@TC_LOGIN_001', '@smoke'] }, async ({ loginPage }) => {
      requireCredentials();
      await loginPage.login(env.username, env.password);
      await loginPage.expectLoggedIn();
    });

    test('TC_LOGIN_013 Forgot Password opens the reset screen', { tag: ['@TC_LOGIN_013', '@smoke'] }, async ({ loginPage, page }) => {
      await loginPage.forgotPasswordButton.click();
      await expect(page).toHaveURL(urlPatterns.forgotPassword);
      await expect(loginPage.forgotPasswordEmail).toBeVisible();
    });

    test('TC_LOGIN_015 Start a free trial link points to the trial page', { tag: '@TC_LOGIN_015' }, async ({ loginPage }) => {
      await expect(loginPage.freeTrialLink).toHaveAttribute('href', urlPatterns.freeTrialHref);
    });

    test('TC_LOGIN_023 login page is reachable via app.wingify.com', { tag: '@TC_LOGIN_023' }, async ({ page }) => {
      await page.goto(env.aliasUrl, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/^https:\/\//);
      await expect(new LoginPage(page).email).toBeVisible();
    });
  });

  test.describe('Negative', () => {
    test('TC_LOGIN_002 wrong password shows the auth error', { tag: ['@TC_LOGIN_002', '@smoke'] }, async ({ loginPage }) => {
      await loginPage.login(env.negativeTestEmail, 'Wrong@123');
      await loginPage.expectAuthError();
    });

    test('TC_LOGIN_003 unregistered email shows the same auth error', { tag: '@TC_LOGIN_003' }, async ({ loginPage }) => {
      await loginPage.login('not.registered.qa@example.com', 'Test@1234');
      await loginPage.expectAuthError();
    });

    test('TC_LOGIN_004 empty email and password are rejected', { tag: '@TC_LOGIN_004' }, async ({ loginPage }) => {
      await loginPage.signInButton.click();
      await loginPage.expectAuthError();
    });

    test('TC_LOGIN_005 empty password is rejected and email is kept', { tag: '@TC_LOGIN_005' }, async ({ loginPage }) => {
      await loginPage.login(env.negativeTestEmail, '');
      await loginPage.expectAuthError();
      await expect(loginPage.email).toHaveValue(env.negativeTestEmail);
    });

    test('TC_LOGIN_006 malformed email is rejected', { tag: '@TC_LOGIN_006' }, async ({ loginPage, failures }) => {
      await loginPage.login('abc@', 'Test@1234');
      await loginPage.expectAuthError();
      expect(failures.pageErrors).toEqual([]);
    });

    test('TC_LOGIN_007 password is case-sensitive', { tag: '@TC_LOGIN_007' }, async ({ loginPage }) => {
      requireCredentials();
      const inverted = [...env.password].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');
      test.skip(inverted === env.password, 'Configured password has no letters to invert');
      await loginPage.login(env.username, inverted);
      await loginPage.expectAuthError();
    });
  });

  test.describe('Boundary', () => {
    test('TC_LOGIN_008 single-character password is rejected', { tag: '@TC_LOGIN_008' }, async ({ loginPage, failures }) => {
      await loginPage.login(env.negativeTestEmail, boundary.singleCharPassword);
      await loginPage.expectAuthError();
      expect(failures.serverErrors).toEqual([]);
    });

    test('TC_LOGIN_009 very long email and password are handled', { tag: '@TC_LOGIN_009' }, async ({ loginPage, failures }) => {
      await loginPage.login(boundary.longEmail, boundary.longPassword);
      await loginPage.expectAuthError();
      expect(failures.serverErrors).toEqual([]);
    });

    test('TC_LOGIN_010 surrounding whitespace in email is trimmed', { tag: '@TC_LOGIN_010' }, async ({ loginPage }) => {
      requireCredentials();
      await loginPage.login(`  ${env.username}  `, env.password);
      await loginPage.expectLoggedIn();
    });
  });

  test.describe('UI', () => {
    test('TC_LOGIN_011 Remember me is unchecked by default and toggles', { tag: '@TC_LOGIN_011' }, async ({ loginPage }) => {
      await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
      await loginPage.rememberMeLabel.click();
      await expect(loginPage.rememberMeCheckbox).toBeChecked();
      await loginPage.rememberMeLabel.click();
      await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
    });

    test('TC_LOGIN_024 layout shows all labelled controls', { tag: '@TC_LOGIN_024' }, async ({ loginPage }) => {
      for (const control of [
        loginPage.email,
        loginPage.password,
        loginPage.passwordToggle,
        loginPage.rememberMeLabel,
        loginPage.forgotPasswordButton,
        loginPage.freeTrialLink,
        loginPage.googleButton,
        loginPage.ssoButton,
        loginPage.passkeyButton,
      ]) {
        await expect(control).toBeVisible();
      }
      await expect(loginPage.signInButton).toBeEnabled();
    });
  });

  test.describe('Security', () => {
    test('TC_LOGIN_018 password is masked and the toggle reveals it', { tag: '@TC_LOGIN_018' }, async ({ loginPage }) => {
      await loginPage.password.fill('Test@1234');
      await expect(loginPage.password).toHaveAttribute('type', 'password');
      await loginPage.passwordToggle.click();
      await expect(loginPage.password).toHaveAttribute('type', 'text');
      await loginPage.passwordToggle.click();
      await expect(loginPage.password).toHaveAttribute('type', 'password');
    });

    test('TC_LOGIN_019 SQL injection is rejected without leaking errors', { tag: '@TC_LOGIN_019' }, async ({ loginPage, page, failures }) => {
      await loginPage.login(payloads.sqlInjection.email, payloads.sqlInjection.password);
      await loginPage.expectAuthError();
      expect(failures.serverErrors).toEqual([]);
      await expect(page.locator('body')).not.toContainText(/sql|syntax error|stack trace|exception/i);
    });

    test('TC_LOGIN_020 XSS payloads are not executed', { tag: '@TC_LOGIN_020' }, async ({ loginPage, page }) => {
      const dialogs: string[] = [];
      page.on('dialog', async (d) => {
        dialogs.push(d.message());
        await d.dismiss();
      });
      await loginPage.login(payloads.xss.email, payloads.xss.password);
      await loginPage.expectAuthError();
      expect(dialogs).toEqual([]);
      await expect(page.locator('img[src="x"]')).toHaveCount(0);
    });

    test('TC_LOGIN_022 HTTP is redirected to HTTPS with a valid certificate', { tag: '@TC_LOGIN_022' }, async ({ page }) => {
      const response = await page.goto(env.baseUrl.replace(/^https:/, 'http:') + '/#/login', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/^https:\/\//);
      const tls = await response?.securityDetails();
      if (tls?.validTo) expect(tls.validTo * 1000).toBeGreaterThan(Date.now());
    });
  });

  test.describe('Accessibility', () => {
    test('TC_LOGIN_025 login can be completed with the keyboard only', { tag: '@TC_LOGIN_025' }, async ({ loginPage, page }) => {
      await expect(loginPage.email).toBeFocused();
      await page.keyboard.type(env.negativeTestEmail);
      await page.keyboard.press('Tab');
      await expect(loginPage.password).toBeFocused();
      await page.keyboard.type('Wrong@123');
      await page.keyboard.press('Enter');
      await loginPage.expectAuthError();
    });

    test('TC_LOGIN_026 no critical or serious WCAG 2.1 AA violations', { tag: '@TC_LOGIN_026' }, async ({ page }, testInfo) => {
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      await testInfo.attach('axe-results.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      const blocking = results.violations
        .filter((v) => v.impact === 'critical' || v.impact === 'serious')
        .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`);
      expect(blocking).toEqual([]);
    });
  });

  test.describe('Performance', () => {
    test('TC_LOGIN_028 DOMContentLoaded is within the threshold', { tag: '@TC_LOGIN_028' }, async ({ loginPage }, testInfo) => {
      const ms = await loginPage.domContentLoadedMs();
      testInfo.annotations.push({ type: 'DOMContentLoaded (ms)', description: ms.toFixed(0) });
      expect(ms).toBeLessThanOrEqual(env.pageLoadThresholdMs);
    });

    test('TC_LOGIN_029 page works on Slow 3G', { tag: '@TC_LOGIN_029' }, async ({ page, browserName, failures }) => {
      test.skip(browserName !== 'chromium', 'Network throttling uses the Chrome DevTools Protocol');
      test.setTimeout(120_000);
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', slow3G);
      const loginPage = new LoginPage(page);
      const start = Date.now();
      await page.goto('about:blank');
      await page.goto('/#/login', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(loginPage.signInButton).toBeVisible({ timeout: 60_000 });
      test.info().annotations.push({ type: 'Slow 3G render (ms)', description: String(Date.now() - start) });
      expect(Date.now() - start).toBeLessThanOrEqual(15_000);
      await loginPage.login(env.negativeTestEmail, 'Wrong@123');
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 60_000 });
      expect(failures.pageErrors).toEqual([]);
    });
  });

  test.describe('Compatibility', () => {
    test('TC_LOGIN_030 invalid login behaves identically in this browser', { tag: '@TC_LOGIN_030' }, async ({ loginPage, failures }) => {
      await loginPage.login(env.negativeTestEmail, 'Wrong@123');
      await loginPage.expectAuthError();
      expect(failures.pageErrors).toEqual([]);
    });

    test('TC_LOGIN_031 responsive layout has no horizontal scroll', { tag: '@TC_LOGIN_031' }, async ({ loginPage, page }) => {
      for (const vp of viewports) {
        await test.step(`${vp.name} ${vp.width}x${vp.height}`, async () => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await loginPage.goto();
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(overflow).toBeLessThanOrEqual(0);
          await loginPage.signInButton.scrollIntoViewIfNeeded();
          await expect(loginPage.signInButton).toBeInViewport();
          const box = await loginPage.signInButton.boundingBox();
          expect.soft(box?.height ?? 0).toBeGreaterThanOrEqual(44);
        });
      }
    });
  });
});
