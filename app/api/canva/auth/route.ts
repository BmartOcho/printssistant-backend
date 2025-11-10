import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler for Canva.
 *
 * After the user completes the Canva consent flow, Canva will redirect
 * the browser back to this endpoint with a `code` query parameter. This
 * handler exchanges that authorization code for access and refresh
 * tokens using the PKCE code verifier that was stored in a secure cookie
 * during the `/auth` step.  The resulting tokens are returned in a
 * simple HTML page so that you can copy them into your environment
 * variables (e.g. `CANVA_ACCESS_TOKEN`, `CANVA_REFRESH_TOKEN`).
 */
export async function GET(request: NextRequest) {
  // Read required configuration values from the environment
  const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
  const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
  const CANVA_API_BASE = process.env.CANVA_API_BASE || "https://api.canva.com";
  const REDIRECT_LOCAL =
    process.env.CANVA_REDIRECT_URI || "http://127.0.0.1:4000/callback";
  const REDIRECT_PROD =
    process.env.CANVA_REDIRECT_URI_PROD ||
    "https://printssistant-backend.vercel.app/api/canva/callback";

  // Extract the authorization code from the query string
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing `code` query parameter", { status: 400 });
  }

  // Retrieve the PKCE code_verifier from the cookie set during the auth step
  const codeVerifier = request.cookies.get("canva_code_verifier")?.value;
  if (!codeVerifier) {
    return new Response(
      "Missing PKCE code_verifier cookie. Start the OAuth flow again.",
      { status: 400 },
    );
  }

  if (!CANVA_CLIENT_ID || !CANVA_CLIENT_SECRET) {
    return new Response(
      "Missing CANVA_CLIENT_ID or CANVA_CLIENT_SECRET in environment variables",
      { status: 500 },
    );
  }

  // Determine which redirect URI Canva expects based on the host
  const host =
    (request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "").toLowerCase();
  const redirectUri =
    host.includes("vercel.app") || host.includes("printssistant")
      ? REDIRECT_PROD
      : REDIRECT_LOCAL;

  // Build form-encoded body for token exchange request
  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", redirectUri);
  params.set("client_id", CANVA_CLIENT_ID);
  params.set("client_secret", CANVA_CLIENT_SECRET);
  params.set("code_verifier", codeVerifier);

  // Exchange the authorization code for tokens
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

  // Parse the JSON body to get the tokens
  const { access_token, refresh_token, expires_in } = await tokenRes.json();

  // Prepare a simple HTML response summarizing the tokens
  const html = `\n<pre>✅ Tokens acquired!\n\naccess_token: ${
    access_token?.toString().slice(0, 12) || ""
  }…\nrefresh_token: ${
    refresh_token ? refresh_token.toString().slice(0, 12) + "…" : "(none)"
  }\nexpires_in: ${expires_in}s\n\nPlease copy these tokens into your Vercel project\nvariables (CANVA_ACCESS_TOKEN and CANVA_REFRESH_TOKEN).\n</pre>`;

  // Clear the code verifier cookie now that we've used it
  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
  response.cookies.delete("canva_code_verifier");
  return response;
}