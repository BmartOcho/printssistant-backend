import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { from, subject, body: emailBody, attachments, receivedAt } = body

    if (!from || !subject) {
      return NextResponse.json({ error: "Missing required fields: from, subject" }, { status: 400 })
    }

    // Process the email job data
    const jobData = {
      source: "email",
      customerEmail: from,
      subject,
      description: emailBody || "",
      attachments: attachments || [],
      receivedAt: receivedAt || new Date().toISOString(),
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

    console.log("[v0] Email job received:", jobData)

    return NextResponse.json({
      success: true,
      message: "Job received from email",
      jobId: `email-${Date.now()}`, // Replace with actual DB ID
      data: jobData,
    })
  } catch (error) {
    console.error("[v0] Error processing email job:", error)
    return NextResponse.json({ error: "Failed to process email job" }, { status: 500 })
  }
}
