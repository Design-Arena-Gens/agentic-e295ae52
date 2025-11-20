import { NextResponse } from "next/server";
import { getLoginUrl } from "../../../../lib/facebook";

export const runtime = "nodejs";

export async function GET() {
  const url = getLoginUrl();
  return NextResponse.redirect(url);
}
