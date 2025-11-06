import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (recommended for production)
    // const signature = request.headers.get('x-canva-signature')
    // if (!verifyCanvaSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // Process Canva webhook event
    const { event_type, design_id, design_title, export_url, user_id, timestamp } = body

    console.log("[v0] Canva webhook received:", { event_type, design_id })

    // Handle different event types
    if (event_type === "design.export.completed") {
      const jobData = {
        source: "canva",
        designId: design_id,
        designTitle: design_title || "Untitled Design",
        exportUrl: export_url,
        canvaUserId: user_id,
        status: "pending",
        createdAt: timestamp || new Date().toISOString(),
      }

      // TODO: Store in Supabase
      // const supabase = createServerClient(...)
      // const { data, error } = await supabase
      //   .from('print_jobs')
      //   .insert(jobData)
      //   .select()
      //   .single()

      console.log("[v0] Canva job created:", jobData)

      return NextResponse.json({
        success: true,
        message: "Canva design received",
        jobId: `canva-${Date.now()}`,
        data: jobData,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received",
    })
  } catch (error) {
    console.error("[v0] Error processing Canva webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
