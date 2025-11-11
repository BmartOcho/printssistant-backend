import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const signature = request.headers.get("x-canva-signature")
    const webhookSecret = process.env.CANVA_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      // Basic signature verification - enhance for production
      // You would typically use crypto.createHmac to verify
      console.log("[v0] Verifying Canva webhook signature")
    }

    // Process Canva webhook event
    const { event_type, design_id, design_title, export_url, user_id, timestamp } = body

    console.log("[v0] Canva webhook received:", { event_type, design_id })

    // Handle different event types
    if (event_type === "design.export.completed") {
      const supabase = createServiceClient()

      const sanitized = (value: unknown) =>
        typeof value === "string" ? value.replace(/[^a-zA-Z0-9._%+-]/g, "").slice(0, 64) : ""

      const fallbackEmail =
        sanitized(user_id)?.length > 0
          ? `${sanitized(user_id)}@canva.local`
          : sanitized(design_id)?.length > 0
            ? `${sanitized(design_id)}@canva.local`
            : "canva@system.local"

      const jobData = {
        source: "canva",
        customer_email: fallbackEmail,
        design_id: design_id,
        design_title: design_title || "Untitled Design",
        export_url: export_url,
        canva_user_id: user_id,
        status: "pending",
        created_at: timestamp || new Date().toISOString(),
      }

      // Insert into Supabase
      const { data, error } = await supabase.from("print_jobs").insert(jobData).select().single()

      if (error) {
        console.error("[v0] Supabase error:", error)
        return NextResponse.json({ error: "Failed to store job in database" }, { status: 500 })
      }

      console.log("[v0] Canva job stored:", data.id)

      return NextResponse.json({
        success: true,
        message: "Canva design received and stored",
        jobId: data.id,
        data,
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
