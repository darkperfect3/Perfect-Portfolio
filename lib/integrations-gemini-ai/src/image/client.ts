import { relayGenerateImage } from "@workspace/integrations-ai-relay";

export async function generateImage(
  prompt: string,
): Promise<{ b64_json: string; mimeType: string }> {
  return relayGenerateImage(prompt);
}
