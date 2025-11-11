import { type NextRequest, NextResponse } from "next/server"
import { createHash, randomBytes } from "node:crypto"

const TEN_MINUTES = 60 * 10

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export async function GET(request: NextRequest) {
  const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID
  const CANVA_SCOPES =
    process.env.CANVA_SCOPES ??
    "design:content:read design:content:write asset:write asset:read webhook:manage"
  const CANVA_AUTH_BASE = process.env.CANVA_AUTH_BASE || "https://www.canva.com"
  const CANVA_AUTH_PATH = process.env.CANVA_AUTH_PATH || "/api/rest/v1/oauth/authorize"
  const CANVA_REDIRECT_URI_LOCAL = process.env.CANVA_REDIRECT_URI || "http://127.0.0.1:3000/api/canva/auth"
  const CANVA_REDIRECT_URI_PROD =
    process.env.CANVA_REDIRECT_URI_PROD || "https://printssistant-backend.vercel.app/api/canva/auth"

  if (!CANVA_CLIENT_ID) {
    return NextResponse.json(
      { error: "Missing CANVA_CLIENT_ID env variable. Add it to start the OAuth flow." },
      { status: 500 },
    )
  }

  const url = new URL(request.url)
  const host =
    (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").toLowerCase()
  const redirectUri =
    host.includes("vercel.app") || host.includes("printssistant") ? CANVA_REDIRECT_URI_PROD : CANVA_REDIRECT_URI_LOCAL

  // Generate PKCE verifier/challenge and state
  const codeVerifier = base64UrlEncode(randomBytes(64))
  const codeChallenge = base64UrlEncode(createHash("sha256").update(codeVerifier).digest())
  const state = base64UrlEncode(randomBytes(24))
  const prompt = url.searchParams.get("prompt") || "consent"

  const authorizeParams = new URLSearchParams({
    response_type: "code",
    client_id: CANVA_CLIENT_ID,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: CANVA_SCOPES,
    state,
    prompt,
  })

  const authorizeUrl = `${CANVA_AUTH_BASE}${CANVA_AUTH_PATH}?${authorizeParams.toString()}`

  const response = NextResponse.redirect(authorizeUrl, { status: 302 })
  response.cookies.set("canva_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: TEN_MINUTES,
  })
  response.cookies.set("canva_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: TEN_MINUTES,
  })

  return response
}
