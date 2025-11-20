import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userAccessToken?: string;
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || "change_me_in_env_for_prod_32+chars",
  cookieName: "afbu_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  // Next.js App Router compatible
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
