import { relayGenerateImage } from "@workspace/integrations-ai-relay";

export async function generateImage(prompt: string): Promise<string> {
  const { b64_json, mimeType } = await relayGenerateImage(prompt);
  return `data:${mimeType};base64,${b64_json}`;
}
