# Printssistant Backend Setup Guide

## Project Overview
This Next.js backend handles print job submissions from multiple sources:
- Email (via email parsing service)
- Web form submissions
- Canva webhook integration

## API Endpoints

### 1. Email Job Endpoint
**URL:** `POST /api/jobs/email`

**Payload Example:**
\`\`\`json
{
  "from": "customer@example.com",
  "subject": "Print Job Request",
  "body": "I need 100 copies of my flyer",
  "attachments": [
    {
      "filename": "flyer.pdf",
      "url": "https://storage.example.com/flyer.pdf"
    }
  ],
  "receivedAt": "2025-01-15T10:30:00Z"
}
\`\`\`

### 2. Web Form Job Endpoint
**URL:** `POST /api/jobs/form`

**Payload Example:**
\`\`\`json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "jobTitle": "Business Cards",
  "description": "500 business cards, glossy finish",
  "quantity": 500,
  "paperSize": "3.5x2",
  "colorMode": "color",
  "urgency": "normal",
  "fileUrls": ["https://storage.example.com/design.pdf"]
}
\`\`\`

### 3. Canva Webhook Endpoint
**URL:** `POST /api/webhooks/canva`

**Payload Example:**
\`\`\`json
{
  "event_type": "design.export.completed",
  "design_id": "DAFxxx",
  "design_title": "My Poster Design",
  "export_url": "https://export.canva.com/xxx/poster.pdf",
  "user_id": "user_123",
  "timestamp": "2025-01-15T10:30:00Z"
}
\`\`\`

## Supabase Setup

### Step 1: Connect Supabase Integration
1. In v0, open the in-chat sidebar
2. Click on "Connect" section
3. Add Supabase integration
4. Follow the prompts to connect your Supabase project

### Step 2: Run Database Migration
1. The SQL script in \`scripts/create-print-jobs-table.sql\` will create the necessary table
2. v0 can run this script directly for you
3. Or you can run it manually in your Supabase SQL editor

### Step 3: Update API Routes
Once Supabase is connected, uncomment the database code in:
- \`app/api/jobs/email/route.ts\`
- \`app/api/jobs/form/route.ts\`
- \`app/api/webhooks/canva/route.ts\`

Replace the TODO sections with actual Supabase calls using the \`createServerClient\` function.

## Canva Webhook Setup

### Step 1: Create Canva App
1. Go to [Canva Developers](https://www.canva.com/developers/)
2. Create a new app or use existing app
3. Navigate to "Webhooks" section

### Step 2: Configure Webhook
1. Add webhook URL: \`https://your-domain.vercel.app/api/webhooks/canva\`
2. Subscribe to events:
   - \`design.export.completed\`
   - \`design.published\` (optional)
3. Save your webhook secret for signature verification

### Step 3: Verify Webhook (Recommended for Production)
Uncomment the signature verification code in \`app/api/webhooks/canva/route.ts\`:

\`\`\`typescript
const signature = request.headers.get('x-canva-signature')
if (!verifyCanvaSignature(signature, body)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
\`\`\`

Add signature verification function:
\`\`\`typescript
function verifyCanvaSignature(signature: string | null, body: any): boolean {
  if (!signature) return false
  const secret = process.env.CANVA_WEBHOOK_SECRET!
  // Implement HMAC verification based on Canva's documentation
  return true // Replace with actual verification
}
\`\`\`

### Step 4: Add Environment Variable
Add \`CANVA_WEBHOOK_SECRET\` to your Vercel project environment variables.

## Email Integration Setup

To receive emails and forward them to the \`/api/jobs/email\` endpoint, you can use:

### Option 1: SendGrid Inbound Parse
1. Configure SendGrid Inbound Parse webhook
2. Point it to: \`https://your-domain.vercel.app/api/jobs/email\`
3. Parse email data and forward as JSON

### Option 2: Mailgun Routes
1. Set up Mailgun route
2. Forward to your API endpoint
3. Transform email data to match expected payload

### Option 3: Custom Email Service
Create a middleware service that:
1. Receives emails via SMTP/IMAP
2. Parses attachments and content
3. POSTs to your API endpoint

## Testing

### Test Email Endpoint
\`\`\`bash
curl -X POST https://your-domain.vercel.app/api/jobs/email \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "test@example.com",
    "subject": "Test Job",
    "body": "Test description"
  }'
\`\`\`

### Test Form Endpoint
\`\`\`bash
curl -X POST https://your-domain.vercel.app/api/jobs/form \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerEmail": "test@example.com",
    "jobTitle": "Test Print Job",
    "quantity": 10
  }'
\`\`\`

### Test Canva Webhook
\`\`\`bash
curl -X POST https://your-domain.vercel.app/api/webhooks/canva \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "design.export.completed",
    "design_id": "TEST123",
    "design_title": "Test Design",
    "export_url": "https://example.com/test.pdf"
  }'
\`\`\`

## Environment Variables Required

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
CANVA_WEBHOOK_SECRET=your-canva-webhook-secret
\`\`\`

## Next Steps

1. Connect Supabase integration via v0 sidebar
2. Run the database migration script
3. Update API routes to use Supabase
4. Configure Canva webhook in Canva Developer Portal
5. Set up email forwarding service
6. Test all endpoints
7. Deploy to Vercel

## Support

For issues or questions:
- Check v0 documentation
- Review Supabase logs in dashboard
- Test webhooks using Canva's webhook testing tool
- Monitor API logs in Vercel dashboard
\`\`\`
