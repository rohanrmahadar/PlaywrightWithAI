import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { publicSettings, resolveConfig, AppError } from './config.js';
import { normalizeKey, fetchIssue, testJira } from './jira.js';
import { testLlm } from './llm.js';
import { generatePlan } from './generator.js';

// Stateless API: each request carries the user's config (entered in the Settings page),
// merged over optional server .env defaults. Nothing is stored server-side.
export const app = express();
app.use(express.json({ limit: '64kb' }));

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

app.get('/api/settings', (_req, res) => res.json(publicSettings()));

app.post('/api/test/jira', wrap(async (req, res) => res.json(await testJira(resolveConfig(req.body?.config)))));
app.post('/api/test/llm', wrap(async (req, res) => res.json(await testLlm(resolveConfig(req.body?.config), req.body?.provider))));

app.post('/api/generate', wrap(async (req, res) => {
  const key = normalizeKey(req.body?.issueKey);
  const cfg = resolveConfig(req.body?.config);
  const issue = await fetchIssue(cfg, key);
  const plan = await generatePlan(issue, cfg);
  res.json({
    issue: { key: issue.key, url: issue.url, summary: issue.summary, acceptanceCriteriaFound: Boolean(issue.acceptanceCriteria) },
    ...plan,
  });
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.', code: 'NOT_FOUND' }));

// Serve the built React app (local runs; Vercel serves it as static output)
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message, code: err.code });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.', code: 'BAD_JSON' });
  console.error('Unexpected error:', err?.message); // never log request bodies (they contain credentials)
  res.status(500).json({ error: 'Unexpected server error.', code: 'INTERNAL' });
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    const s = publicSettings();
    console.log(`Test Plan Generator on http://localhost:${port}`);
    console.log(`Server defaults — Jira URL set: ${Boolean(s.jiraUrl)} | Jira token set: ${s.jiraTokenSet} | Groq key set: ${s.groqKeySet}`);
  });
}
