import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { from, subject, body: emailBody, attachments, receivedAt } = body

    if (!from || !subject) {
      return NextResponse.json({ error: "Missing required fields: from, subject" }, { status: 400 })
    }

    const supabase = await createClient()

    // Prepare job data matching the database schema
    const jobData = {
      source: "email",
      customer_email: from,
      subject,
      description: emailBody || "",
      attachments: attachments || [],
      received_at: receivedAt || new Date().toISOString(),
      status: "pending",
    }

    // Insert into Supabase
    const { data, error } = await supabase.from("print_jobs").insert(jobData).select().single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to store job in database" }, { status: 500 })
    }

    console.log("[v0] Email job stored:", data.id)

    return NextResponse.json({
      success: true,
      message: "Job received from email and stored",
      jobId: data.id,
      data,
    })
  } catch (error) {
    console.error("[v0] Error processing email job:", error)
    return NextResponse.json({ error: "Failed to process email job" }, { status: 500 })
  }
}
