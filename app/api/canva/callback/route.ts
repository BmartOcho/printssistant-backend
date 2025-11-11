import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler for Canva ("/api/canva/callback").
 * Mirrors the logic in /api/canva/auth but with redirect_uri defaulting
 * to this callback path, to match typical Canva app settings.
 */
export async function GET(request: NextRequest) {
  const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
  const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
  const CANVA_API_BASE = process.env.CANVA_API_BASE || "https://api.canva.com";
  const REDIRECT_LOCAL = process.env.CANVA_REDIRECT_URI || "http://localhost:3000/api/canva/callback";
  const REDIRECT_PROD = process.env.CANVA_REDIRECT_URI_PROD || undefined; // If not set, we compute from host

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateFromQuery = url.searchParams.get("state");
  if (!code) {
    return new Response("Missing `code` query parameter", { status: 400 });
  }

  const codeVerifier = request.cookies.get("canva_code_verifier")?.value;
  const stateFromCookie = request.cookies.get("canva_oauth_state")?.value;
  if (!codeVerifier) {
    return new Response(
      "Missing PKCE code_verifier cookie. Start the OAuth flow again.",
      { status: 400 },
    );
  }
  if (!stateFromQuery || !stateFromCookie || stateFromQuery !== stateFromCookie) {
    return new Response("Invalid or missing OAuth state. Start the flow again.", { status: 400 });
  }

  if (!CANVA_CLIENT_ID || !CANVA_CLIENT_SECRET) {
    return new Response(
      "Missing CANVA_CLIENT_ID or CANVA_CLIENT_SECRET in environment variables",
      { status: 500 },
    );
  }

  const hostHeader = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").toLowerCase();
  const proto = (request.headers.get("x-forwarded-proto") || "https").toLowerCase();
  const computedProdRedirect = hostHeader ? `${proto}://${hostHeader}/api/canva/callback` : undefined;
  const redirectUri = hostHeader.includes("vercel.app") || hostHeader.includes("printssistant")
    ? (REDIRECT_PROD || computedProdRedirect || REDIRECT_LOCAL)
    : REDIRECT_LOCAL;

  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", redirectUri);
  params.set("client_id", CANVA_CLIENT_ID);
  params.set("client_secret", CANVA_CLIENT_SECRET);
  params.set("code_verifier", codeVerifier);

  const tokenRes = await fetch(`${CANVA_API_BASE}/rest/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    return new Response(
      `OAuth token exchange failed. Status ${tokenRes.status}: ${errorText}`,
      { status: tokenRes.status },
    );
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json();

  const html = `\n<pre>✅ Tokens acquired!\n\naccess_token: ${
    access_token?.toString().slice(0, 12) || ""
  }...\nrefresh_token: ${
    refresh_token ? refresh_token.toString().slice(0, 12) + "..." : "(none)"
  }\nexpires_in: ${expires_in}s\n\nPlease copy these tokens into your Vercel project\nvariables (CANVA_ACCESS_TOKEN and CANVA_REFRESH_TOKEN).\n</pre>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
  response.cookies.delete("canva_code_verifier");
  response.cookies.delete("canva_oauth_state");
  return response;
}
