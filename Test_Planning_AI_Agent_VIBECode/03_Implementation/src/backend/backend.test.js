// Unit checks. Jira and LLM calls are MOCKED here — these do not prove live integration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeKey, adfToText, mapIssue, extractAcceptanceCriteria } from './jira.js';
import { generatePlan, templateHeadings, cleanOutput } from './generator.js';
import { loadTemplate } from './config.js';

test('normalizeKey validates and uppercases', () => {
  assert.equal(normalizeKey(' qa-123 '), 'QA-123');
  assert.throws(() => normalizeKey(''), /Enter a Jira issue ID/);
  assert.throws(() => normalizeKey('123'), /not a valid Jira issue ID/);
  assert.throws(() => normalizeKey('QA-12; drop'), /not a valid/);
});

test('adfToText converts ADF paragraphs and lists', () => {
  const doc = { type: 'doc', content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Acceptance Criteria' }] },
    { type: 'bulletList', content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'User can log in' }] }] },
    ] },
  ] };
  assert.equal(adfToText(doc), '## Acceptance Criteria\n- User can log in\n');
});

test('extractAcceptanceCriteria reads the AC section of a description', () => {
  assert.equal(extractAcceptanceCriteria('Intro\n## Acceptance Criteria\n- A\n- B\n## Notes\nx'), '- A\n- B');
  assert.equal(extractAcceptanceCriteria('No criteria here'), '');
});

test('mapIssue keeps key, link and metadata (MOCK Jira payload)', () => {
  const issue = mapIssue({
    key: 'QA-1',
    names: { customfield_1: 'Acceptance Criteria' },
    fields: { summary: 'Login', labels: ['b', 'a'], customfield_1: 'Must work', issuetype: { name: 'Story' } },
  }, 'https://x.atlassian.net');
  assert.equal(issue.url, 'https://x.atlassian.net/browse/QA-1');
  assert.deepEqual(issue.labels, ['a', 'b']);
  assert.equal(issue.acceptanceCriteria, 'Must work');
});

test('generatePlan uses the template and reports missing sections (MOCK LLM)', async () => {
  const template = loadTemplate();
  const headings = templateHeadings(template);
  assert.ok(headings.length >= 8);
  const issue = mapIssue({ key: 'QA-1', fields: { summary: 'Login' } }, 'https://x');
  let sent;
  const full = await generatePlan(issue, {}, async (_c, m) => { sent = m; return { text: '```markdown\n' + headings.join('\n') + '\n```', model: 'mock' }; });
  assert.deepEqual(full.missingSections, []);
  assert.ok(!full.markdown.startsWith('```'));
  assert.match(sent[1].content, /<jira_source>[\s\S]*QA-1/);
  const partial = await generatePlan(issue, {}, async () => ({ text: headings[0], model: 'mock' }));
  assert.equal(partial.missingSections.length, headings.length - 1);
  await assert.rejects(generatePlan(issue, {}, async () => ({ text: '  ', model: 'mock' })), /empty response/);
});

test('cleanOutput strips think blocks', () => {
  assert.equal(cleanOutput('<think>x</think>\n# Plan'), '# Plan');
});

test('resolveConfig never sends the server Jira token to a different Jira URL', async () => {
  const { resolveConfig } = await import('./config.js');
  assert.equal(resolveConfig({ jiraUrl: 'https://other.example.com' }).jiraToken, '');
  assert.equal(resolveConfig({ jiraUrl: 'https://other.example.com', jiraToken: 'mine' }).jiraToken, 'mine');
  assert.throws(() => resolveConfig({ jiraUrl: 'ftp://x' }), /not a valid/);
});
