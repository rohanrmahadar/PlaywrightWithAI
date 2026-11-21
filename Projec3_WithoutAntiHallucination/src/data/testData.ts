export const routes = {
  login: '/#/login',
  forgotPassword: '/#/forgot-password',
  dashboard: '/#/dashboard',
} as const;

export const messages = {
  authError: 'Your email, password, IP address or location did not match',
} as const;

export const urlPatterns = {
  login: /#\/login/,
  forgotPassword: /#\/forgot-password/,
  freeTrial: /\/free-trial\//,
  /** A fully resolved href: real hostname, no un-rendered {{ }} template placeholders. */
  freeTrialHref: /^https:\/\/[a-z0-9.-]+\/free-trial\//,
} as const;

export const payloads = {
  sqlInjection: { email: "' OR '1'='1' --", password: "' OR '1'='1" },
  xss: { email: "<script>alert('XSS')</script>@example.com", password: '"><img src=x onerror=alert(1)>' },
} as const;

export const boundary = {
  singleCharPassword: 'a',
  longEmail: `${'a'.repeat(64)}@${'d'.repeat(247)}.com`,
  longPassword: 'P'.repeat(1000),
} as const;

export const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
] as const;

/** Chrome DevTools "Slow 3G" preset. */
export const slow3G = {
  offline: false,
  latency: 2000,
  downloadThroughput: (400 * 1024) / 8,
  uploadThroughput: (400 * 1024) / 8,
};
