// Claude-kald går via ai-proxy edge-funktionen (TRACK-db-instansen) — API-nøglen
// ligger i Supabase secrets og når aldrig browseren. Proxyen falder selv tilbage
// til Gemini hvis Anthropic fejler, og svarer altid i Claude-format.
const AI_PROXY_URL = 'https://yktaxljydisfjyqhbnja.supabase.co/functions/v1/ai-proxy';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function askClaude(
  messages: ClaudeMessage[],
  opts: { max_tokens?: number; system?: string } = {}
): Promise<string> {
  const response = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'claude',
      messages,
      max_tokens: opts.max_tokens ?? 4096,
      ...(opts.system ? { system: opts.system } : {}),
    }),
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err?.error) msg = err.error;
    } catch { /* behold HTTP-status som besked */ }
    throw new Error(msg);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}
