# Printssistant Backend Setup Guide

## ✅ Project Status

**Your Supabase database is already connected and working!**

All API endpoints are now storing job data directly in your Supabase `print_jobs` table with Row Level Security (RLS) enabled.

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

## ✅ Supabase - Already Connected!

Your Supabase Pro database is configured and ready. The integration includes:

- **Database Connection**: Active and working
- **Table**: `print_jobs` table created with proper schema
- **RLS Policies**: 
  - Authenticated users can read all jobs
  - Authenticated users can update jobs
  - Service role can insert new jobs (used by API routes)
- **Environment Variables**: Automatically configured by v0

### Database Schema

The `print_jobs` table includes:
\`\`\`sql
- id (uuid, primary key)
- source (text) - "email", "web_form", or "canva"
- customer_name, customer_email, customer_phone (text)
- job_title, subject, description (text)
- quantity (integer)
- paper_size, color_mode, urgency (text)
- file_urls, attachments (jsonb)
- export_url, design_id, design_title (text)
- canva_user_id (text)
- status (text) - "pending", "processing", "completed", "cancelled"
- received_at, created_at, updated_at (timestamp)
\`\`\`

### View Your Data
To see jobs in your database:
1. Open the v0 sidebar
2. Click "Connect" section
3. Click on your Supabase integration
4. Access your Supabase dashboard to view the `print_jobs` table

## Canva Webhook Setup

### Step 1: Create Canva App
1. Go to [Canva Developers](https://www.canva.com/developers/)
2. Create a new app or use existing app
3. Navigate to "Webhooks" section

### Step 2: Configure Webhook
1. Add webhook URL: `https://your-domain.vercel.app/api/webhooks/canva`
   - Replace `your-domain` with your actual Vercel domain after deployment
2. Subscribe to event: `design.export.completed`
3. Copy the webhook signing secret from Canva

### Step 3: Add Webhook Secret
Add the Canva webhook secret as an environment variable:

1. In v0, open the in-chat sidebar
2. Click "Vars" section
3. Add new environment variable:
   - Key: `CANVA_WEBHOOK_SECRET`
   - Value: (paste your webhook secret from Canva)

### Step 4: Test Canva Integration
1. Export a design from Canva
2. Check your Supabase `print_jobs` table for the new entry
3. Verify it includes `design_id`, `export_url`, and `design_title`

## Email Integration Setup

To receive emails and forward them to the `/api/jobs/email` endpoint:

### Option 1: SendGrid Inbound Parse
1. Configure SendGrid Inbound Parse webhook
2. Point it to: `https://your-domain.vercel.app/api/jobs/email`
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

All endpoints are live and storing data in Supabase!

### Test Email Endpoint
\`\`\`bash
curl -X POST https://your-domain.vercel.app/api/jobs/email \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@example.com",
    "subject": "Test Job",
    "body": "Test description"
  }'
\`\`\`

### Test Form Endpoint
\`\`\`bash
curl -X POST https://your-domain.vercel.app/api/jobs/form \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "jobTitle": "Test Print Job",
    "quantity": 10
  }'
\`\`\`

### Test Canva Webhook
\`\`\`bash
curl -X POST https://your-domain.vercel.app/api/webhooks/canva \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "design.export.completed",
    "design_id": "TEST123",
    "design_title": "Test Design",
    "export_url": "https://example.com/test.pdf"
  }'
\`\`\`

## Environment Variables

### Already Configured (via Supabase integration):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- All Postgres connection strings

### You Need to Add:
- `CANVA_WEBHOOK_SECRET` - Get this from Canva Developer Portal after creating your webhook

## Next Steps

1. ✅ ~~Connect Supabase~~ - Already done!
2. ✅ ~~Create database table~~ - Already created!
3. ✅ ~~Configure API routes~~ - Already working!
4. **Deploy to Vercel** - Click "Publish" button in v0
5. **Configure Canva webhook** - Follow steps above
6. **Set up email forwarding** - Choose an email service
7. **Test all endpoints** - Use the curl commands above

## Support

For issues or questions:
- **Supabase issues**: Check the "Connect" section in v0 sidebar
- **Environment variables**: Use the "Vars" section in v0 sidebar
- **API errors**: Check the v0 console logs (look for `[v0]` prefix)
- **Canva webhook**: Use Canva's webhook testing tool in Developer Portal
