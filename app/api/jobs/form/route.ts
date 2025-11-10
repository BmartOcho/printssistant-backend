import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const {
      customerName,
      customerEmail,
      customerPhone,
      jobTitle,
      description,
      quantity,
      paperSize,
      colorMode,
      urgency,
      fileUrls,
    } = body

    if (!customerEmail || !jobTitle) {
      return NextResponse.json({ error: "Missing required fields: customerEmail, jobTitle" }, { status: 400 })
    }

    const supabase = await createClient()

    // Prepare job data matching the database schema
    const jobData = {
      source: "web_form",
      customer_name: customerName || "",
      customer_email: customerEmail,
      customer_phone: customerPhone || "",
      job_title: jobTitle,
      description: description || "",
      quantity: quantity || 1,
      paper_size: paperSize || "A4",
      color_mode: colorMode || "color",
      urgency: urgency || "normal",
      file_urls: fileUrls || [],
      status: "pending",
    }

    // Insert into Supabase
    const { data, error } = await supabase.from("print_jobs").insert(jobData).select().single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to store job in database" }, { status: 500 })
    }

    console.log("[v0] Form job stored:", data.id)

    return NextResponse.json({
      success: true,
      message: "Job received from web form and stored",
      jobId: data.id,
      data,
    })
  } catch (error) {
    console.error("[v0] Error processing form job:", error)
    return NextResponse.json({ error: "Failed to process form job" }, { status: 500 })
  }
}
