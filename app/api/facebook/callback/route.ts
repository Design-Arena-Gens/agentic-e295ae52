import { NextResponse } from "next/server";
import { exchangeCodeForUserToken } from "../../../../lib/facebook";
import { getSession } from "../../../../lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(`/?error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.redirect("/?error=missing_code");
  }
  try {
    const token = await exchangeCodeForUserToken(code);
    const session = await getSession();
    session.userAccessToken = token.access_token;
    await session.save();
    return NextResponse.redirect("/");
  } catch (e: any) {
    return NextResponse.redirect(`/?error=${encodeURIComponent(e.message || "auth_failed")}`);
  }
}
