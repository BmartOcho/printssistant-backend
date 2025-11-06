import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    } = body ?? {}

    if (!customerEmail || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail, jobTitle' },
        { status: 400 }
      )
    }

    const jobData = {
      source: 'web_form',
      customer_name: customerName ?? '',
      customer_email: customerEmail,
      customer_phone: customerPhone ?? '',
      job_title: jobTitle,
      description: description ?? '',
      quantity: quantity ?? 1,
      paper_size: paperSize ?? 'A4',
      color_mode: colorMode ?? 'color',
      urgency: urgency ?? 'normal',
      file_urls: fileUrls ?? [],
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('print_jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) {
      console.error('[Supabase] insert(form) failed:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Job received from web form',
      jobId: data.id,
      data,
    })
  } catch (error) {
    console.error('[form-job] Error:', error)
    return NextResponse.json({ error: 'Failed to process form job' }, { status: 500 })
  }
}
