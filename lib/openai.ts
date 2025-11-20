import OpenAI from "openai";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Defer throw to runtime when route is invoked, not during build import
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}

export async function generateImageBase64(prompt: string): Promise<string> {
  const client = getOpenAI();
  const result = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    response_format: "b64_json",
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned");
  return b64;
}
