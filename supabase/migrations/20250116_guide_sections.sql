-- =====================================================
-- GUIDE_SECTIONS TABLE
-- Stores customizable guide sections for activities
-- =====================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS guide_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  category TEXT DEFAULT 'before',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint on activity + section_key
  UNIQUE(activity, section_key)
);

-- Create index for faster queries by activity
CREATE INDEX IF NOT EXISTS idx_guide_sections_activity ON guide_sections(activity);

-- Enable RLS
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop if exist first)
DROP POLICY IF EXISTS "Allow authenticated read guide_sections" ON guide_sections;
DROP POLICY IF EXISTS "Allow authenticated insert guide_sections" ON guide_sections;
DROP POLICY IF EXISTS "Allow authenticated update guide_sections" ON guide_sections;
DROP POLICY IF EXISTS "Allow authenticated delete guide_sections" ON guide_sections;

CREATE POLICY "Allow authenticated read guide_sections" ON guide_sections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert guide_sections" ON guide_sections
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update guide_sections" ON guide_sections
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete guide_sections" ON guide_sections
  FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON guide_sections TO authenticated;
GRANT ALL ON guide_sections TO service_role;

-- =====================================================
-- Done! guide_sections table is ready.
-- =====================================================
