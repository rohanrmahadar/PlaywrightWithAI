import React, { useState } from 'react';
import { api } from './api.js';

// .env keys -> config fields
const ENV_MAP = {
  JIRA_URL: 'jiraUrl', JIRA_EMAIL: 'jiraEmail', JIRA_API_TOKEN: 'jiraToken',
  GROQ_API_KEY: 'groqKey', GROQ_MODEL: 'groqModel', OLLAMA_URL: 'ollamaUrl', OLLAMA_MODEL: 'ollamaModel',
};

export function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || !ENV_MAP[m[1]]) continue;
    out[ENV_MAP[m[1]]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

function Status({ s }) {
  if (!s) return null;
  return <p className={`status ${s.busy ? 'muted' : s.ok ? 'ok' : 'error'}`}>{s.busy ? 'Testing…' : s.message}</p>;
}

export default function SettingsPage({ config, setConfig, server }) {
  const [status, setStatus] = useState({});
  const [envText, setEnvText] = useState('');

  const set = (k) => (e) => setConfig((c) => ({ ...c, [k]: e.target.value }));

  function applyEnv(text) {
    const parsed = parseEnv(text);
    const n = Object.keys(parsed).length;
    if (!n) {
      setStatus((s) => ({ ...s, env: { ok: false, message: 'No recognised keys found (JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, GROQ_API_KEY, …).' } }));
      return;
    }
    setConfig((c) => ({ ...c, ...parsed, provider: parsed.groqKey ? 'groq' : c.provider || 'ollama' }));
    setEnvText(''); // don't keep raw secrets in the textarea
    setStatus((s) => ({ ...s, env: { ok: true, message: `Loaded ${n} value(s) from .env.` } }));
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) applyEnv(await file.text());
  }

  async function test(name, path, body) {
    setStatus((s) => ({ ...s, [name]: { busy: true } }));
    try {
      const r = await api(path, { method: 'POST', body: { config, ...body } });
      setStatus((s) => ({ ...s, [name]: r }));
    } catch (e) {
      setStatus((s) => ({ ...s, [name]: { ok: false, message: e.message } }));
    }
  }

  const busy = Object.values(status).some((s) => s?.busy);
  const ph = (flag, text) => (flag ? '•••••••• (server default — leave blank to use it)' : text);

  return (
    <main className="page settings-page">
      <h2>Settings</h2>
      {server?.error && <p className="status error">Cannot reach the backend server.</p>}

      <section className="box card">
        <h3>Load .env file</h3>
        <div className="row">
          <label className="btn file-btn">Choose .env file<input type="file" accept=".env,.txt,text/plain" onChange={onFile} hidden /></label>
        </div>
        <textarea rows={4} value={envText} onChange={(e) => setEnvText(e.target.value)} spellCheck={false}
          placeholder={'…or paste it here:\nJIRA_URL=https://your-domain.atlassian.net\nJIRA_EMAIL=you@company.com\nJIRA_API_TOKEN=…\nGROQ_API_KEY=…'} />
        <button className="btn" disabled={!envText.trim()} onClick={() => applyEnv(envText)}>Apply</button>
        <Status s={status.env} />
      </section>

      <section className="box card">
        <h3>JIRA Connection</h3>
        <label>Token
          <input type="password" autoComplete="off" value={config.jiraToken} onChange={set('jiraToken')}
            placeholder={ph(server?.jiraTokenSet, 'Jira API token')} />
        </label>
        <label>Email<input type="email" value={config.jiraEmail} onChange={set('jiraEmail')} placeholder={server?.jiraEmailSet && !server?.jiraEmail ? '(server default — leave blank to use it)' : 'you@company.com'} /></label>
        <label>URL<input value={config.jiraUrl} onChange={set('jiraUrl')} placeholder="https://your-domain.atlassian.net" /></label>
        <button className="btn" disabled={busy} onClick={() => test('jira', '/test/jira')}>Test Connection</button>
        <Status s={status.jira} />
      </section>

      <section className="box card">
        <h3>LLM Configuration</h3>
        <ol>
          <li>
            <label className="radio"><input type="radio" name="provider" checked={config.provider === 'ollama'} onChange={() => setConfig((c) => ({ ...c, provider: 'ollama' }))} /> Ollama Connection</label>
            <input value={config.ollamaUrl} onChange={set('ollamaUrl')} placeholder="http://localhost:11434" aria-label="Ollama URL" />
          </li>
          <li>
            <label className="radio"><input type="radio" name="provider" checked={config.provider === 'groq'} onChange={() => setConfig((c) => ({ ...c, provider: 'groq' }))} />
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">↗ Groq.com</a>&nbsp;(api Key)</label>
            <input type="password" autoComplete="off" value={config.groqKey} onChange={set('groqKey')} aria-label="Groq API key"
              placeholder={ph(server?.groqKeySet, 'gsk_…')} />
          </li>
        </ol>
        <div className="row">
          <button className="btn" disabled={busy} onClick={() => test('ollama', '/test/llm', { provider: 'ollama' })}>Test Local LLM</button>
          <button className="btn" disabled={busy} onClick={() => test('groq', '/test/llm', { provider: 'groq' })}>Test Groq.com</button>
        </div>
        <Status s={status.ollama} />
        <Status s={status.groq} />
        {server?.hosted && <p className="muted small">Hosted version: a local Ollama (localhost) cannot be reached from the cloud — use Groq.</p>}
      </section>
      <p className="muted small">Credentials are kept only in this page's memory, sent to the backend with each request, and never stored. Reloading the page clears them.</p>
    </main>
  );
}
