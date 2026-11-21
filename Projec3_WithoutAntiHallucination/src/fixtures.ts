import { test as base, type Page } from '@playwright/test';
import { env } from './config/env';
import { LoginPage } from './pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
  /** Collects HTTP 5xx responses and uncaught page errors for later assertions. */
  failures: { serverErrors: string[]; pageErrors: string[] };
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  failures: async ({ page }, use) => {
    const failures = { serverErrors: [] as string[], pageErrors: [] as string[] };
    page.on('response', (r) => {
      if (r.status() >= 500) failures.serverErrors.push(`${r.status()} ${r.url()}`);
    });
    page.on('pageerror', (e) => failures.pageErrors.push(e.message));
    await use(failures);
  },
});

export { expect } from '@playwright/test';

/** Skips the current test when no real account is configured in .env. */
export function requireCredentials(): void {
  test.skip(!env.hasCredentials, 'Set VWO_USERNAME and VWO_PASSWORD in .env to run this test');
}

export async function loginWithValidUser(page: Page): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.username, env.password);
  await loginPage.expectLoggedIn();
  return loginPage;
}

/**
 * Registers automation-candidate test cases whose locators have not yet been captured
 * from the live DOM. They show as "fixme" in the report so the backlog stays traceable.
 */
export function backlog(cases: ReadonlyArray<readonly [id: string, title: string]>, reason: string): void {
  for (const [id, title] of cases) {
    test.fixme(`${id} ${title}`, { tag: `@${id}`, annotation: { type: 'backlog', description: reason } }, async () => {});
  }
}
