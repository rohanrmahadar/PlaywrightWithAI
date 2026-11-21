import { expect, type Locator, type Page } from '@playwright/test';
import { messages, routes, urlPatterns } from '../data/testData';

/** Locators below were verified against the live DOM of https://app.vwo.com/#/login. */
export class LoginPage {
  readonly form: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly passwordToggle: Locator;
  readonly signInButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly rememberMeLabel: Locator;
  readonly forgotPasswordButton: Locator;
  readonly freeTrialLink: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordEmail: Locator;
  readonly googleButton: Locator;
  readonly ssoButton: Locator;
  readonly passkeyButton: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator('#js-login-form');
    this.email = page.locator('#login-username');
    this.password = page.locator('#login-password');
    this.passwordToggle = page.locator('#login-password ~ button[aria-label="Toggle password visibility"]');
    this.signInButton = page.locator('#js-login-btn');
    this.rememberMeCheckbox = page.locator('#checkbox-remember');
    this.rememberMeLabel = page.locator('label[for="checkbox-remember"]');
    this.forgotPasswordButton = this.form.getByRole('button', { name: 'Forgot Password?' });
    this.freeTrialLink = this.form.getByRole('link', { name: 'Start a free trial' });
    this.errorMessage = page.locator('#js-notification-box-msg');
    this.forgotPasswordEmail = page.locator('#forgot-password-username');
    this.googleButton = page.locator('#js-google-signin-btn');
    this.ssoButton = this.form.getByRole('button', { name: 'Sign in using SSO' });
    this.passkeyButton = this.form.getByRole('button', { name: 'Sign in with Passkey' });
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.login, { waitUntil: 'domcontentloaded' });
    await expect(this.email).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
  }

  async expectAuthError(): Promise<void> {
    await expect(this.errorMessage).toHaveText(messages.authError);
    await expect(this.page).toHaveURL(urlPatterns.login);
  }

  async expectLoggedIn(): Promise<void> {
    await this.page.waitForURL((url) => !url.hash.includes('login'), { timeout: 20_000 });
    await expect(this.email).toBeHidden();
  }

  /** DOMContentLoaded time (ms) of the current document, from the Navigation Timing API. */
  async domContentLoadedMs(): Promise<number> {
    return this.page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return nav.domContentLoadedEventEnd - nav.startTime;
    });
  }
}
