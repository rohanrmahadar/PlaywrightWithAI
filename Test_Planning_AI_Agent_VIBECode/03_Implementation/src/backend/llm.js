import { AppError } from './config.js';

const GEN = { temperature: 0, seed: 42 }; // deterministic where the provider supports it

async function call(url, opts, label) {
  const { timeout = 180000, ...init } = opts;
  let res;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) });
  } catch {
    throw new AppError(502, 'LLM_NETWORK', `Could not reach ${label}.`);
  }
  if (res.status === 401 || res.status === 403) throw new AppError(401, 'LLM_AUTH', `${label} rejected the API key.`);
  if (res.status === 429) throw new AppError(429, 'LLM_RATE_LIMIT', `${label} rate limit reached. Try again shortly.`);
  if (!res.ok) throw new AppError(502, 'LLM_ERROR', `${label} returned HTTP ${res.status}.`);
  return res.json();
}

const groqHeaders = (settings) => {
  if (!settings.groqKey) throw new AppError(500, 'CONFIG_MISSING', 'Groq API key is not configured (GROQ_API_KEY).');
  return { Authorization: `Bearer ${settings.groqKey}`, 'Content-Type': 'application/json' };
};

async function ollamaModel(settings) {
  if (settings.ollamaModel) return settings.ollamaModel;
  const tags = await call(`${settings.ollamaUrl}/api/tags`, { timeout: 5000 }, 'Ollama');
  const names = (tags.models ?? []).map((m) => m.name).sort();
  if (!names.length) throw new AppError(500, 'CONFIG_MISSING', 'Ollama has no models installed. Run "ollama pull <model>".');
  return names[0];
}

export async function testLlm(settings, provider) {
  if (provider === 'groq') {
    const data = await call('https://api.groq.com/openai/v1/models', { headers: groqHeaders(settings), timeout: 10000 }, 'Groq');
    const ok = (data.data ?? []).some((m) => m.id === settings.groqModel);
    return {
      ok,
      message: ok
        ? `Groq connected. Model: ${settings.groqModel}.`
        : `Groq connected, but model "${settings.groqModel}" is not available (set GROQ_MODEL).`,
    };
  }
  if (provider === 'ollama') {
    const model = await ollamaModel(settings);
    return { ok: true, message: `Ollama connected at ${settings.ollamaUrl}. Model: ${model}.` };
  }
  throw new AppError(400, 'BAD_PROVIDER', 'Unknown LLM provider.');
}

export async function chat(settings, messages) {
  if (settings.provider === 'groq') {
    const data = await call('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: groqHeaders(settings),
      body: JSON.stringify({ model: settings.groqModel, messages, ...GEN }),
    }, 'Groq');
    return { text: data.choices?.[0]?.message?.content ?? '', model: `groq/${settings.groqModel}` };
  }
  const model = await ollamaModel(settings);
  const data = await call(`${settings.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, options: { ...GEN, num_ctx: 16384 } }),
  }, 'Ollama');
  return { text: data.message?.content ?? '', model: `ollama/${model}` };
}
