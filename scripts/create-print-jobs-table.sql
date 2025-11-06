-- Create print_jobs table for storing job data from multiple sources
CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source information
  source TEXT NOT NULL CHECK (source IN ('email', 'web_form', 'canva')),
  
  -- Customer information
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Job details
  job_title TEXT,
  subject TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  paper_size TEXT,
  color_mode TEXT,
  urgency TEXT,
  
  -- File information
  attachments JSONB DEFAULT '[]'::jsonb,
  file_urls JSONB DEFAULT '[]'::jsonb,
  export_url TEXT,
  
  -- Canva specific
  design_id TEXT,
  design_title TEXT,
  canva_user_id TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  
  -- Timestamps
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT valid_email CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_print_jobs_source ON print_jobs(source);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_customer_email ON print_jobs(customer_email);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created_at ON print_jobs(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_print_jobs_updated_at
  BEFORE UPDATE ON print_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all jobs
CREATE POLICY "Allow authenticated users to read jobs"
  ON print_jobs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for service role to insert jobs (for API routes)
CREATE POLICY "Allow service role to insert jobs"
  ON print_jobs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy for authenticated users to update jobs
CREATE POLICY "Allow authenticated users to update jobs"
  ON print_jobs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
