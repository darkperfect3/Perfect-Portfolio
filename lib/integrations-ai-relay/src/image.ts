export interface ImageResult {
  b64_json: string;
  mimeType: string;
}

async function callImageProvider(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<ImageResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Image provider responded ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json().catch(() => null)) as any;
    // Try a few common response shapes
    if (!data) throw new Error("Empty image provider response");

    // common: { data: { b64: '...', mime: 'image/png' } }
    if (data.data && typeof data.data.b64 === "string") {
      return { b64_json: data.data.b64, mimeType: data.data.mime || "image/png" };
    }

    // other shape: { b64_json: '...', mimeType: 'image/png' }
    if (typeof data.b64_json === "string") {
      return { b64_json: data.b64_json, mimeType: data.mimeType || "image/png" };
    }

    // another shape: { result: { base64: '...' } }
    if (data.result && typeof data.result.base64 === "string") {
      return { b64_json: data.result.base64, mimeType: data.result.mime || "image/png" };
    }

    throw new Error("Unsupported image provider response shape");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Relay image generation through Mistral -> Qwen -> DeepSeek.
 * Tries each provider in order until one returns an image.
 */
export async function relayGenerateImage(prompt: string): Promise<ImageResult> {
  const providers = [
    {
      name: "mistral",
      envKey: "MISTRAL_API_KEY",
      url: "https://api.mistral.ai/v1/images/generate",
      body: (p: string) => ({ model: "mistral-image-small", prompt: p }),
    },
    {
      name: "qwen",
      envKey: "QWEN_API_KEY",
      url: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/images/generate",
      body: (p: string) => ({ model: "qwen-image", prompt: p }),
    },
    {
      name: "deepseek",
      envKey: "DEEPSEEK_API_KEY",
      url: "https://api.deepseek.com/images/generate",
      body: (p: string) => ({ prompt: p }),
    },
  ];

  const errors: string[] = [];

  for (const prov of providers) {
    const key = process.env[prov.envKey];
    if (!key) {
      errors.push(`${prov.name}: ${prov.envKey} not set`);
      continue;
    }

    try {
      const res = await callImageProvider(prov.url, key, prov.body(prompt));
      return res;
    } catch (err) {
      errors.push(`${prov.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(`All image providers failed: ${errors.join(" | ")}`);
}
