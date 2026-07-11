export type RelayRole = "system" | "user" | "assistant";

export interface RelayMessage {
  role: RelayRole;
  content: string;
}

export interface RelayProvider {
  name: "mistral" | "qwen" | "deepseek";
  envKey: string;
  url: string;
  model: string;
}

export const RELAY_PROVIDERS: RelayProvider[] = [
  {
    name: "mistral",
    envKey: "MISTRAL_API_KEY",
    url: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
  },
  {
    name: "qwen",
    envKey: "QWEN_API_KEY",
    url: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    model: "qwen-plus",
  },
  {
    name: "deepseek",
    envKey: "DEEPSEEK_API_KEY",
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
  },
];

async function callProvider(
  provider: RelayProvider,
  messages: RelayMessage[],
  maxTokens: number,
): Promise<string> {
  const apiKey = process.env[provider.envKey];
  if (!apiKey) {
    throw new Error(`${provider.envKey} is not set`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`${provider.name} responded with ${response.status}: ${text.slice(0, 300)}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`${provider.name} returned an empty response`);
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}

export interface RelayResult {
  content: string;
  provider: RelayProvider["name"];
}

/**
 * Relays a chat completion request through the fallback chain:
 * Mistral -> Qwen -> DeepSeek. Tries each provider in order until one succeeds.
 */
export async function relayChatCompletion(
  messages: RelayMessage[],
  options?: { maxTokens?: number },
): Promise<RelayResult> {
  const maxTokens = options?.maxTokens ?? 1024;
  const errors: string[] = [];

  for (const provider of RELAY_PROVIDERS) {
    try {
      const content = await callProvider(provider, messages, maxTokens);
      return { content, provider: provider.name };
    } catch (err) {
      errors.push(`${provider.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(`All AI providers failed in the relay chain: ${errors.join(" | ")}`);
}
