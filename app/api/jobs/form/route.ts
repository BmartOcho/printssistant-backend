import { type NextRequest, NextResponse } from "next/server"

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

    // Process the form job data
    const jobData = {
      source: "web_form",
      customerName: customerName || "",
      customerEmail,
      customerPhone: customerPhone || "",
      jobTitle,
      description: description || "",
      quantity: quantity || 1,
      paperSize: paperSize || "A4",
      colorMode: colorMode || "color",
      urgency: urgency || "normal",
      fileUrls: fileUrls || [],
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    // TODO: Store in Supabase
    // const supabase = createServerClient(...)
    // const { data, error } = await supabase
    //   .from('print_jobs')
    //   .insert(jobData)
    //   .select()
    //   .single()

    console.log("[v0] Form job received:", jobData)

    return NextResponse.json({
      success: true,
      message: "Job received from web form",
      jobId: `form-${Date.now()}`, // Replace with actual DB ID
      data: jobData,
    })
  } catch (error) {
    console.error("[v0] Error processing form job:", error)
    return NextResponse.json({ error: "Failed to process form job" }, { status: 500 })
  }
}
