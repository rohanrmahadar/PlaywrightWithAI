import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
// Test_Planning_AI_Agent/ (three levels up from src/backend)
export const PROJECT_ROOT = path.resolve(here, '../../..');
export const ENV_PATH = path.join(PROJECT_ROOT, '.env');
// Authoritative template lives in 02_Plan; a synced copy is bundled for hosted (Vercel) deployments.
const TEMPLATE_PATHS = [path.join(PROJECT_ROOT, '02_Plan', 'TestPlan_Template.md'), path.join(here, 'TestPlan_Template.md')];

dotenv.config({ path: ENV_PATH, quiet: true });

const env = (k, d = '') => (process.env[k] ?? d).trim();
const trimUrl = (u) => String(u ?? '').trim().replace(/\/+$/, '');
const str = (v) => (typeof v === 'string' ? v.trim() : '');

// Optional server-side defaults (local .env). On Vercel none are set: users supply their own in the UI.
const server = {
  jiraUrl: trimUrl(env('JIRA_URL')),
  jiraEmail: env('JIRA_EMAIL'),
  jiraToken: env('JIRA_API_TOKEN'),
  groqKey: env('GROQ_API_KEY'),
  groqModel: env('GROQ_MODEL'),
  ollamaUrl: trimUrl(env('OLLAMA_URL')),
  ollamaModel: env('OLLAMA_MODEL'),
};

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
export const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const isUrl = (v) => { try { return /^https?:$/.test(new URL(v).protocol); } catch { return false; } };

// Merge per-request config (from the browser) over server defaults.
// The server's Jira token is only ever sent to the server's own Jira URL.
export function resolveConfig(input = {}) {
  const c = typeof input === 'object' && input ? input : {};
  const jiraUrl = trimUrl(str(c.jiraUrl)) || server.jiraUrl;
  const ollamaUrl = trimUrl(str(c.ollamaUrl)) || server.ollamaUrl || DEFAULT_OLLAMA_URL;
  if (jiraUrl && !isUrl(jiraUrl)) throw new AppError(400, 'BAD_URL', 'Jira URL is not a valid http(s) URL.');
  if (!isUrl(ollamaUrl)) throw new AppError(400, 'BAD_URL', 'Ollama URL is not a valid http(s) URL.');
  const groqKey = str(c.groqKey) || server.groqKey;
  const provider = ['groq', 'ollama'].includes(c.provider) ? c.provider : groqKey ? 'groq' : 'ollama';
  return {
    jiraUrl,
    jiraEmail: str(c.jiraEmail) || server.jiraEmail,
    jiraToken: str(c.jiraToken) || (jiraUrl === server.jiraUrl ? server.jiraToken : ''),
    groqKey,
    groqModel: str(c.groqModel) || server.groqModel || DEFAULT_GROQ_MODEL,
    ollamaUrl,
    ollamaModel: str(c.ollamaModel) || server.ollamaModel,
    provider,
  };
}

// Non-secret view of the server defaults for the Settings page.
export function publicSettings() {
  const hosted = Boolean(process.env.VERCEL);
  return {
    jiraUrl: server.jiraUrl,
    jiraEmail: hosted ? '' : server.jiraEmail, // don't expose the owner's email on the public site
    jiraEmailSet: Boolean(server.jiraEmail),
    jiraTokenSet: Boolean(server.jiraToken),
    groqKeySet: Boolean(server.groqKey),
    ollamaUrl: server.ollamaUrl || DEFAULT_OLLAMA_URL,
    provider: server.groqKey ? 'groq' : 'ollama',
    hosted,
  };
}

export function loadTemplate() {
  const p = TEMPLATE_PATHS.find((f) => fs.existsSync(f));
  if (!p) throw new AppError(500, 'TEMPLATE_MISSING', 'Test plan template not found (02_Plan/TestPlan_Template.md).');
  return fs.readFileSync(p, 'utf8');
}
