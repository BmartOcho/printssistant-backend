import { NextRequest, NextResponse } from "next/server";

/**
 * Create a new blank Canva design using the Canva REST API.
 *
 * This endpoint expects a JSON body with `name`, `width` and `height`. It
 * retrieves an access token from the environment (`CANVA_ACCESS_TOKEN`)
 * and calls Canva's `/rest/v1/designs` endpoint to create the design. The
 * response from Canva (containing the design ID and edit URLs) is
 * proxied back to the caller.  You should ensure that the token has
 * sufficient scopes (design:content:write, asset:write, etc.) in the
 * Canva developer console.
 */
export async function POST(request: NextRequest) {
  // Ensure we have the required access token
  const accessToken = process.env.CANVA_ACCESS_TOKEN;
  const CANVA_API_BASE = process.env.CANVA_API_BASE || "https://api.canva.com";
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing CANVA_ACCESS_TOKEN in environment" },
      { status: 500 },
    );
  }

  // Parse the incoming request body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const { name, width, height } = body || {};
  if (!name || !width || !height) {
    return NextResponse.json(
      { error: "Missing required fields: name, width, height" },
      { status: 400 },
    );
  }

  // Assemble the payload expected by Canva's design creation endpoint
  const payload = {
    name: String(name),
    dimensions: {
      unit: "INCH",
      width: Number(width),
      height: Number(height),
    },
  };

  // Call Canva's API
  const canvaRes = await fetch(`${CANVA_API_BASE}/rest/v1/designs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!canvaRes.ok) {
    const text = await canvaRes.text();
    return NextResponse.json(
      {
        error: "Failed to create design",
        details: text,
      },
      { status: canvaRes.status },
    );
  }

  const data = await canvaRes.json();
  return NextResponse.json(data, { status: 200 });
}

// Respond with 405 for unsupported methods
export function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}