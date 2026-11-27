import { AppError } from './config.js';

export const ISSUE_KEY_RE = /^[A-Z][A-Z0-9_]+-\d+$/;

export function normalizeKey(input) {
  const key = String(input ?? '').trim().toUpperCase();
  if (!key) throw new AppError(400, 'EMPTY_KEY', 'Enter a Jira issue ID, e.g. PROJ-123.');
  if (!ISSUE_KEY_RE.test(key)) {
    throw new AppError(400, 'INVALID_KEY', `"${String(input).trim().slice(0, 40)}" is not a valid Jira issue ID (expected format PROJ-123).`);
  }
  return key;
}

function requireJiraConfig(settings) {
  const missing = [];
  if (!settings.jiraUrl) missing.push('JIRA_URL');
  if (!settings.jiraEmail) missing.push('JIRA_EMAIL');
  if (!settings.jiraToken) missing.push('JIRA_API_TOKEN');
  if (missing.length) throw new AppError(500, 'CONFIG_MISSING', `Jira configuration missing: ${missing.join(', ')}.`);
}

// Jira Cloud (atlassian.net) uses REST v3 (ADF descriptions); Server/DC uses v2.
const apiVersion = (settings) => (/atlassian\.net/i.test(settings.jiraUrl) ? '3' : '2');

async function jiraGet(settings, pathname) {
  requireJiraConfig(settings);
  const auth = Buffer.from(`${settings.jiraEmail}:${settings.jiraToken}`).toString('base64');
  let res;
  try {
    res = await fetch(`${settings.jiraUrl}/rest/api/${apiVersion(settings)}${pathname}`, {
      method: 'GET', // read-only: this app never modifies Jira
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new AppError(502, 'JIRA_NETWORK', 'Could not reach Jira. Check the Jira URL and your network connection.');
  }
  if (res.ok) return res.json();
  const map = {
    400: [400, 'JIRA_BAD_REQUEST', 'Jira rejected the request.'],
    401: [401, 'JIRA_AUTH', 'Jira authentication failed. Check the email and API token.'],
    403: [403, 'JIRA_FORBIDDEN', 'Your Jira account does not have permission to view this issue.'],
    404: [404, 'JIRA_NOT_FOUND', 'Jira issue not found, or you do not have access to it.'],
  };
  const [s, c, m] = map[res.status] ?? [502, 'JIRA_ERROR', `Jira returned an unexpected error (HTTP ${res.status}).`];
  throw new AppError(s, c, m);
}

export async function testJira(settings) {
  const me = await jiraGet(settings, "/myself");
  return { ok: true, message: `Connected to Jira as ${me.displayName ?? 'authenticated user'}.` };
}

// Atlassian Document Format -> plain text (keeps list/heading structure).
export function adfToText(node, depth = 0) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map((n) => adfToText(n, depth)).join('');
  const kids = () => adfToText(node.content ?? [], depth);
  switch (node.type) {
    case 'text': return node.text ?? '';
    case 'hardBreak': return '\n';
    case 'paragraph': return `${kids()}\n`;
    case 'heading': return `${'#'.repeat(node.attrs?.level ?? 2)} ${kids()}\n`;
    case 'bulletList':
    case 'orderedList':
      return (node.content ?? [])
        .map((li, i) => `${'  '.repeat(depth)}${node.type === 'orderedList' ? `${i + 1}.` : '-'} ${adfToText(li.content ?? [], depth + 1).trim()}\n`)
        .join('');
    case 'codeBlock': return '```\n' + kids() + '\n```\n';
    case 'mention': return node.attrs?.text ?? '';
    case 'inlineCard': return node.attrs?.url ?? '';
    case 'tableRow': return `| ${(node.content ?? []).map((c) => adfToText(c.content ?? []).trim()).join(' | ')} |\n`;
    default: return kids();
  }
}

const toText = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'object' && v.type === 'doc') return adfToText(v).trim();
  return '';
};

// Fallback when there is no dedicated AC field: take the "Acceptance Criteria" section of the description.
export function extractAcceptanceCriteria(description) {
  const lines = description.split('\n');
  const start = lines.findIndex((l) => /^\s*(#+\s*|\*+\s*)?acceptance criteria\b/i.test(l));
  if (start < 0) return '';
  const out = [];
  for (const l of lines.slice(start + 1)) {
    if (/^\s*#+\s/.test(l)) break; // next heading
    out.push(l);
  }
  return out.join('\n').trim();
}

export function mapIssue(raw, baseUrl) {
  const f = raw.fields ?? {};
  const names = raw.names ?? {};
  const fieldByName = (re) => Object.keys(names).sort().find((id) => re.test(names[id]) && f[id] != null);

  const description = toText(f.description);
  const acId = fieldByName(/acceptance criteria/i);
  const acceptanceCriteria = acId ? toText(f[acId]) || String(f[acId]) : extractAcceptanceCriteria(description);
  const sprintId = fieldByName(/^sprint$/i);
  const sprints = sprintId && Array.isArray(f[sprintId]) ? f[sprintId].map((s) => s?.name).filter(Boolean) : [];

  return {
    key: raw.key,
    url: `${baseUrl}/browse/${raw.key}`,
    summary: f.summary ?? '',
    issueType: f.issuetype?.name ?? '',
    status: f.status?.name ?? '',
    priority: f.priority?.name ?? '',
    labels: [...(f.labels ?? [])].sort(),
    components: (f.components ?? []).map((c) => c.name).sort(),
    fixVersions: (f.fixVersions ?? []).map((v) => v.name).sort(),
    sprints,
    parent: f.parent ? `${f.parent.key}: ${f.parent.fields?.summary ?? ''}` : '',
    subtasks: (f.subtasks ?? []).map((s) => `${s.key}: ${s.fields?.summary ?? ''}`),
    linkedIssues: (f.issuelinks ?? [])
      .map((l) => {
        const o = l.outwardIssue ?? l.inwardIssue;
        const rel = l.outwardIssue ? l.type?.outward : l.type?.inward;
        return o ? `${rel ?? 'relates to'} ${o.key}: ${o.fields?.summary ?? ''}` : '';
      })
      .filter(Boolean),
    description,
    acceptanceCriteria,
    acceptanceCriteriaSource: acId ? `field "${names[acId]}"` : acceptanceCriteria ? 'description section' : '',
  };
}

export async function fetchIssue(settings, key) {
  const raw = await jiraGet(settings, `/issue/${encodeURIComponent(key)}?fields=*all&expand=names`);
  return mapIssue(raw, settings.jiraUrl);
}
