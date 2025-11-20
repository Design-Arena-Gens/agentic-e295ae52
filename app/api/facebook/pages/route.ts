import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import { getUserPages } from "../../../../lib/facebook";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userAccessToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const pages = await getUserPages(session.userAccessToken);
    return NextResponse.json({ pages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "failed" }, { status: 500 });
  }
}
