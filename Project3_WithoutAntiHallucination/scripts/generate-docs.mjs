// Generates docs/VWO_Test_Cases.md and docs/VWO_Test_Cases.csv from docs/test-cases.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const cases = JSON.parse(readFileSync(join(docsDir, 'test-cases.json'), 'utf8'));

const MODULES = ['Login', 'Sign-up', 'Dashboard', 'Campaign', 'Reports'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const TYPES = ['Positive', 'Negative', 'Boundary', 'UI', 'Security', 'Performance', 'Accessibility', 'Compatibility'];
const HEADERS = ['TC_ID', 'Module', 'Scenario', 'Pre-conditions', 'Test Steps', 'Test Data', 'Expected Result', 'Priority', 'Type', 'Automation Candidate (Y/N)'];

const ids = new Set();
for (const c of cases) {
  if (ids.has(c.id)) throw new Error(`Duplicate id ${c.id}`);
  ids.add(c.id);
  if (!MODULES.includes(c.module)) throw new Error(`${c.id}: bad module ${c.module}`);
  if (!PRIORITIES.includes(c.priority)) throw new Error(`${c.id}: bad priority ${c.priority}`);
  if (!TYPES.includes(c.type)) throw new Error(`${c.id}: bad type ${c.type}`);
  if (!['Y', 'N'].includes(c.auto)) throw new Error(`${c.id}: bad auto flag ${c.auto}`);
}

const numbered = (steps, sep) => steps.map((s, i) => `${i + 1}. ${s}`).join(sep);
const md = (s) => String(s).replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const countBy = (key, values) => values.map((v) => [v, cases.filter((c) => c[key] === v).length]);

const out = [];
out.push('# VWO Web Application - Manual Regression Test Cases', '');
out.push(`Application under test: https://app.vwo.com (alias https://app.wingify.com)  `);
out.push(`Total test cases: **${cases.length}**  `);
out.push('Source of truth: `docs/test-cases.json` (regenerate with `npm run docs`)', '');

for (const mod of MODULES) {
  const rows = cases.filter((c) => c.module === mod);
  out.push(`## ${mod} (${rows.length})`, '');
  out.push(`| ${HEADERS.join(' | ')} |`);
  out.push(`|${HEADERS.map(() => '---').join('|')}|`);
  for (const c of rows) {
    out.push('| ' + [c.id, c.module, c.scenario, c.pre, numbered(c.steps.map(md), '<br>'), c.data, c.expected, c.priority, c.type, c.auto]
      .map((v, i) => (i === 4 ? v : md(v))).join(' | ') + ' |');
  }
  out.push('');
}

out.push('## Summary', '', '### Test cases per module', '', '| Module | Total | Automation candidates (Y) |', '|---|---|---|');
for (const mod of MODULES) {
  const rows = cases.filter((c) => c.module === mod);
  out.push(`| ${mod} | ${rows.length} | ${rows.filter((c) => c.auto === 'Y').length} |`);
}
out.push(`| **Total** | **${cases.length}** | **${cases.filter((c) => c.auto === 'Y').length}** |`, '');

out.push('### Count by priority', '', '| Priority | Count |', '|---|---|');
for (const [p, n] of countBy('priority', PRIORITIES)) out.push(`| ${p} | ${n} |`);
out.push('', '### Count by type', '', '| Type | Count |', '|---|---|');
for (const [t, n] of countBy('type', TYPES)) out.push(`| ${t} | ${n} |`);

out.push('', '### Top 10 smoke test suite', '', '| # | TC_ID | Scenario | Why it is in smoke |', '|---|---|---|---|');
const why = {
  TC_LOGIN_001: 'Core entry point - nothing works without login',
  TC_LOGIN_002: 'Confirms authentication rejects bad credentials',
  TC_LOGIN_013: 'Account recovery path must be reachable',
  TC_SIGNUP_001: 'Acquisition funnel entry point',
  TC_DASH_001: 'Post-login landing page renders',
  TC_DASH_007: 'Session can be terminated',
  TC_DASH_009: 'Protected pages are not exposed anonymously',
  TC_CAMP_001: 'Primary product workflow - create a test',
  TC_CAMP_004: 'Campaign can go live',
  TC_RPT_001: 'Results are visible to the customer',
};
for (const c of cases.filter((c) => c.smoke).sort((a, b) => a.smoke - b.smoke)) {
  out.push(`| ${c.smoke} | ${c.id} | ${md(c.scenario)} | ${why[c.id] ?? ''} |`);
}
out.push('');
writeFileSync(join(docsDir, 'VWO_Test_Cases.md'), out.join('\n'), 'utf8');

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
const csv = [HEADERS.map(csvCell).join(',')];
for (const c of cases) {
  csv.push([c.id, c.module, c.scenario, c.pre, numbered(c.steps, '\n'), c.data, c.expected, c.priority, c.type, c.auto].map(csvCell).join(','));
}
// UTF-8 BOM so Excel opens Unicode test data correctly.
writeFileSync(join(docsDir, 'VWO_Test_Cases.csv'), '\uFEFF' + csv.join('\r\n') + '\r\n', 'utf8');

console.log(`Generated ${cases.length} test cases`);
for (const mod of MODULES) console.log(`  ${mod}: ${cases.filter((c) => c.module === mod).length}`);
console.log('  Priority:', Object.fromEntries(countBy('priority', PRIORITIES)));
console.log('  Type:', Object.fromEntries(countBy('type', TYPES)));
console.log('  Automation Y:', cases.filter((c) => c.auto === 'Y').length);
