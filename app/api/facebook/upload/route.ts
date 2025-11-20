import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import { getPageAccessToken, uploadPhotoToPage } from "../../../../lib/facebook";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.userAccessToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { pageId, caption, imageBase64 } = await req.json();
    if (!pageId || !imageBase64) {
      return NextResponse.json({ error: "Missing pageId or imageBase64" }, { status: 400 });
    }
    const pageAccessToken = await getPageAccessToken(session.userAccessToken, pageId);
    const buffer = Buffer.from(imageBase64, "base64");
    const resp = await uploadPhotoToPage({ pageId, pageAccessToken, imageBuffer: buffer, caption });
    return NextResponse.json({ success: true, facebook: resp });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "upload_failed" }, { status: 500 });
  }
}
