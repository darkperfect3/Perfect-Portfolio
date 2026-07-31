import { relayChatCompletion } from "@workspace/integrations-ai-relay";

/**
 * Compatibility shim: exposes a minimal `ai.models.generateContent` API
 * that delegates to the relay chat completion (text-only). This allows
 * existing callers to keep using the same call sites while routing
 * completions through Mistral/Qwen/DeepSeek.
 */
export const ai = {
  models: {
    async generateContent(opts: { model?: string; contents?: any[]; config?: any }) {
      const contents = opts.contents ?? [];
      const messages = contents.map((c: any) => {
        const role = c.role || "user";
        const text = Array.isArray(c.parts)
          ? c.parts.map((p: any) => p.text || "").join(" ")
          : c.text || "";
        return { role, content: text };
      });

      const result = await relayChatCompletion(messages, { maxTokens: 1024 });

      // Provide a response shape similar to Gemini client minimal needs
      return {
        text: result.content,
        candidates: [{ message: { content: result.content } }],
      };
    },
  },
};
