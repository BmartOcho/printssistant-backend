import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, subject, body: emailBody, attachments, receivedAt } = body ?? {}

    if (!from || !subject) {
      return NextResponse.json({ error: 'Missing required fields: from, subject' }, { status: 400 })
    }

    const jobData = {
      source: 'email',
      customer_email: from,
      subject,
      description: emailBody ?? '',
      attachments: attachments ?? [],
      received_at: receivedAt ?? new Date().toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('print_jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) {
      console.error('[Supabase] insert(email) failed:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Job received from email',
      jobId: data.id,
      data,
    })
  } catch (error) {
    console.error('[email-job] Error:', error)
    return NextResponse.json({ error: 'Failed to process email job' }, { status: 500 })
  }
}
