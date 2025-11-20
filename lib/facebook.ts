const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || "v19.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function getRedirectUri(): string {
  if (process.env.FACEBOOK_REDIRECT_URI) return process.env.FACEBOOK_REDIRECT_URI;
  const base = process.env.APP_BASE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}/api/facebook/callback`;
}

export function getLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID || "",
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: [
      "public_profile",
      "email",
      // for Page posting
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_show_list",
    ].join(","),
  });
  return `${GRAPH_BASE}/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForUserToken(code: string) {
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID || "");
  url.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET || "");
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("code", code);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = await res.json();
  return data as { access_token: string; token_type: string; expires_in: number };
}

export type FacebookPage = { id: string; name: string };

export async function getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
  const url = new URL(`${GRAPH_BASE}/me/accounts`);
  url.searchParams.set("access_token", userAccessToken);
  url.searchParams.set("fields", "id,name");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetching pages failed: ${res.status}`);
  const data = await res.json();
  return (data.data || []) as FacebookPage[];
}

export async function getPageAccessToken(userAccessToken: string, pageId: string): Promise<string> {
  // Get Page token via /{page-id}?fields=access_token
  const url = new URL(`${GRAPH_BASE}/${pageId}`);
  url.searchParams.set("fields", "access_token");
  url.searchParams.set("access_token", userAccessToken);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetching page token failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error("No page access token returned");
  return data.access_token as string;
}

export async function uploadPhotoToPage(args: {
  pageId: string;
  pageAccessToken: string;
  imageBuffer: Buffer;
  caption?: string;
}) {
  const { pageId, pageAccessToken, imageBuffer, caption } = args;
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("source", blob, "image.png");
  if (caption) formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", pageAccessToken);

  const res = await fetch(`${GRAPH_BASE}/${pageId}/photos`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Facebook upload failed: ${res.status} ${errText}`);
  }
  return res.json();
}
