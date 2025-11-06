import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, design_id, design_title, export_url, user_id, timestamp, user_email } = body ?? {}

    // (Optional) verify signature with CANVA_WEBHOOK_SECRET here.

    if (event_type === 'design.export.completed') {
      if (!export_url) {
        return NextResponse.json({ error: 'Missing export_url' }, { status: 400 })
      }

      // Try to attach to the most recent job for this user (by email, if provided)
      let jobId: string | null = null

      if (user_email) {
        const { data: recentJob, error: fetchErr } = await supabaseAdmin
          .from('print_jobs')
          .select('id, customer_email')
          .eq('customer_email', user_email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (fetchErr) {
          console.error('[Supabase] select(canva->recent) failed:', fetchErr)
        }

        if (recentJob) {
          jobId = recentJob.id
          const { error: updateErr } = await supabaseAdmin
            .from('print_jobs')
            .update({
              source: 'canva',
              design_id,
              design_title: design_title ?? 'Untitled Design',
              export_url,
              canva_user_id: user_id ?? null,
              status: 'asset_received',
              updated_at: new Date().toISOString(),
            })
            .eq('id', jobId)

          if (updateErr) {
            console.error('[Supabase] update(canva->job) failed:', updateErr)
            jobId = null // fallback to insert below
          }
        }
      }

      if (!jobId) {
        const { data: created, error: insertErr } = await supabaseAdmin
          .from('print_jobs')
          .insert({
            source: 'canva',
            customer_email: user_email ?? 'unknown@example.com',
            design_id,
            design_title: design_title ?? 'Untitled Design',
            export_url,
            canva_user_id: user_id ?? null,
            status: 'asset_received',
            created_at: timestamp ?? new Date().toISOString(),
          })
          .select()
          .single()

        if (insertErr) {
          console.error('[Supabase] insert(canva) failed:', insertErr)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Canva design received (new job)',
          jobId: created.id,
          data: created,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Canva design attached to existing job',
        jobId,
      })
    }

    return NextResponse.json({ success: true, message: 'Webhook received' })
  } catch (error) {
    console.error('[canva-webhook] Error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
