import { backlog, expect, loginWithValidUser, requireCredentials, test } from '../src/fixtures';
import { env } from '../src/config/env';
import { routes, urlPatterns } from '../src/data/testData';
import { LoginPage } from '../src/pages/LoginPage';

test.describe('Dashboard', () => {
  test('TC_DASH_009 dashboard URL without a session redirects to login', { tag: ['@TC_DASH_009', '@smoke'] }, async ({ page }) => {
    await page.goto(routes.dashboard, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(urlPatterns.login);
    await expect(new LoginPage(page).email).toBeVisible();
  });

  test.describe('Authenticated', () => {
    test.beforeEach(() => requireCredentials());

    test('TC_DASH_001 dashboard loads after login without JS errors', { tag: ['@TC_DASH_001', '@smoke'] }, async ({ page, failures }) => {
      await loginWithValidUser(page);
      await page.waitForLoadState('networkidle');
      expect(failures.pageErrors).toEqual([]);
    });

    test('TC_DASH_012 first-party cookies are Secure and the session cookie is HttpOnly', { tag: '@TC_DASH_012' }, async ({ page, context }) => {
      await loginWithValidUser(page);
      const host = new URL(env.baseUrl).hostname;
      const firstParty = (await context.cookies(env.baseUrl)).filter((c) => host.endsWith(c.domain.replace(/^\./, '')));
      expect(firstParty.length).toBeGreaterThan(0);
      expect(firstParty.filter((c) => !c.secure).map((c) => c.name)).toEqual([]);
      expect(firstParty.some((c) => c.httpOnly)).toBe(true);
    });

    test('TC_DASH_014 dashboard renders within the threshold after Sign in', { tag: '@TC_DASH_014' }, async ({ page }, testInfo) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.email.fill(env.username);
      await loginPage.password.fill(env.password);
      const start = Date.now();
      await loginPage.signInButton.click();
      await loginPage.expectLoggedIn();
      await page.waitForLoadState('networkidle');
      const ms = Date.now() - start;
      testInfo.annotations.push({ type: 'Login to dashboard (ms)', description: String(ms) });
      expect(ms).toBeLessThanOrEqual(env.dashboardLoadThresholdMs);
    });
  });

  backlog(
    [
      ['TC_DASH_002', 'left navigation opens the correct modules'],
      ['TC_DASH_003', 'account switcher changes the active account'],
      ['TC_DASH_004', 'account switcher search with no match'],
      ['TC_DASH_005', 'profile shows name, email and role'],
      ['TC_DASH_007', 'logout ends the session'],
      ['TC_DASH_008', 'Back button after logout does not show data'],
      ['TC_DASH_013', 'logout in one tab invalidates the other tab'],
    ],
    'Capture header, avatar menu, logout and navigation locators from an authenticated session',
  );
});
