import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  baseUrl: process.env.BASE_URL || 'https://app.vwo.com',
  aliasUrl: process.env.ALIAS_URL || 'https://app.wingify.com',
  freeTrialUrl: process.env.FREE_TRIAL_URL || 'https://wingify.com/free-trial/',
  username: process.env.VWO_USERNAME || '',
  password: process.env.VWO_PASSWORD || '',
  negativeTestEmail: process.env.NEGATIVE_TEST_EMAIL || 'testuser@example.com',
  pageLoadThresholdMs: toNumber(process.env.PAGE_LOAD_THRESHOLD_MS, 2000),
  dashboardLoadThresholdMs: toNumber(process.env.DASHBOARD_LOAD_THRESHOLD_MS, 5000),
  get hasCredentials(): boolean {
    return Boolean(this.username && this.password);
  },
};
