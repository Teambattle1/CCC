-- Create table for tracking packing list completions
CREATE TABLE IF NOT EXISTS packing_list_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity TEXT NOT NULL,
  list_type TEXT NOT NULL,
  completed_by TEXT NOT NULL,
  completed_by_name TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  items_checked INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_packing_completions_activity ON packing_list_completions(activity);
CREATE INDEX IF NOT EXISTS idx_packing_completions_date ON packing_list_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_packing_completions_lookup ON packing_list_completions(activity, list_type);

-- Enable Row Level Security
ALTER TABLE packing_list_completions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all completions
CREATE POLICY "Allow authenticated users to read" ON packing_list_completions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON packing_list_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON packing_list_completions TO authenticated;
GRANT ALL ON packing_list_completions TO service_role;
