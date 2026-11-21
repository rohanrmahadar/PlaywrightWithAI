import AxeBuilder from '@axe-core/playwright';
import { backlog, expect, test } from '../src/fixtures';
import { env } from '../src/config/env';
import { urlPatterns, viewports } from '../src/data/testData';

test.describe('Sign-up / free trial', () => {
  test('TC_SIGNUP_001 Start a free trial opens the registration page', { tag: ['@TC_SIGNUP_001', '@smoke'] }, async ({ loginPage, page, context }) => {
    await loginPage.goto();
    await expect(loginPage.freeTrialLink).toHaveAttribute('href', urlPatterns.freeTrialHref);
    // The link may open in a new tab (target="_blank") or in the same tab.
    const opensNewTab = (await loginPage.freeTrialLink.getAttribute('target')) === '_blank';
    const [trialPage] = await Promise.all([
      opensNewTab ? context.waitForEvent('page') : Promise.resolve(page),
      loginPage.freeTrialLink.click(),
    ]);
    await expect(trialPage).toHaveURL(urlPatterns.freeTrial);
    await expect(trialPage.locator('input[type="email"]').first()).toBeVisible();
  });

  test('TC_SIGNUP_013 free trial page has no horizontal scroll on mobile/tablet', { tag: '@TC_SIGNUP_013' }, async ({ page }) => {
    for (const vp of viewports.filter((v) => v.width < 1024)) {
      await test.step(`${vp.name} ${vp.width}x${vp.height}`, async () => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(env.freeTrialUrl, { waitUntil: 'domcontentloaded' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });

  test('TC_SIGNUP_014 no critical or serious WCAG 2.1 AA violations', { tag: '@TC_SIGNUP_014' }, async ({ page }, testInfo) => {
    await page.goto(env.freeTrialUrl, { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('axe-results.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
    const blocking = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => v.id);
    expect(blocking).toEqual([]);
  });

  test('TC_SIGNUP_015 free trial page loads within 3 s', { tag: '@TC_SIGNUP_015' }, async ({ page }, testInfo) => {
    await page.goto(env.freeTrialUrl, { waitUntil: 'load' });
    const ms = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return nav.loadEventEnd - nav.startTime;
    });
    testInfo.annotations.push({ type: 'Load (ms)', description: ms.toFixed(0) });
    expect(ms).toBeLessThanOrEqual(3000);
  });

  backlog(
    [
      ['TC_SIGNUP_003', 'empty email shows a required error'],
      ['TC_SIGNUP_004', 'invalid email formats are rejected'],
      ['TC_SIGNUP_005', 'free/personal email domains are rejected'],
      ['TC_SIGNUP_007', 'email length boundary 254/255'],
      ['TC_SIGNUP_012', 'Terms and Privacy links open the legal pages'],
    ],
    'Capture free-trial form locators (email field, submit button, error elements) from the live DOM',
  );
});
