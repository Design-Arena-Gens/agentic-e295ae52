import { NextResponse } from "next/server";
import { generateImageBase64 } from "../../../lib/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    const b64 = await generateImageBase64(prompt);
    return NextResponse.json({ imageBase64: b64 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
