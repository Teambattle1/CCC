-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- Run this in Supabase SQL Editor to fix RLS warnings
-- =====================================================

-- Note: This script enables RLS and creates permissive policies
-- for authenticated users. Adjust as needed for your security requirements.

-- =====================================================
-- ACTIVITY_LOGS
-- =====================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read activity_logs" ON activity_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert activity_logs" ON activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

GRANT ALL ON activity_logs TO authenticated;
GRANT ALL ON activity_logs TO service_role;

-- =====================================================
-- TEAMLAZER_SCORES
-- =====================================================
ALTER TABLE teamlazer_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read teamlazer_scores" ON teamlazer_scores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert teamlazer_scores" ON teamlazer_scores
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update teamlazer_scores" ON teamlazer_scores
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete teamlazer_scores" ON teamlazer_scores
  FOR DELETE TO authenticated USING (true);

GRANT ALL ON teamlazer_scores TO authenticated;
GRANT ALL ON teamlazer_scores TO service_role;

-- =====================================================
-- GUIDE_SECTIONS
-- =====================================================
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read guide_sections" ON guide_sections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert guide_sections" ON guide_sections
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update guide_sections" ON guide_sections
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON guide_sections TO authenticated;
GRANT ALL ON guide_sections TO service_role;

-- =====================================================
-- FEJLSOGNING_REPORTS
-- =====================================================
ALTER TABLE fejlsogning_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read fejlsogning_reports" ON fejlsogning_reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert fejlsogning_reports" ON fejlsogning_reports
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated delete fejlsogning_reports" ON fejlsogning_reports
  FOR DELETE TO authenticated USING (true);

GRANT ALL ON fejlsogning_reports TO authenticated;
GRANT ALL ON fejlsogning_reports TO service_role;

-- =====================================================
-- PACKING_LISTS (may already have RLS)
-- =====================================================
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow authenticated users to read" ON packing_lists;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON packing_lists;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON packing_lists;

CREATE POLICY "Allow authenticated read packing_lists" ON packing_lists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert packing_lists" ON packing_lists
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update packing_lists" ON packing_lists
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON packing_lists TO authenticated;
GRANT ALL ON packing_lists TO service_role;

-- =====================================================
-- PACKING_LIST_COMPLETIONS (may already have RLS)
-- =====================================================
ALTER TABLE packing_list_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read" ON packing_list_completions;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON packing_list_completions;

CREATE POLICY "Allow authenticated read packing_list_completions" ON packing_list_completions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert packing_list_completions" ON packing_list_completions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated delete packing_list_completions" ON packing_list_completions
  FOR DELETE TO authenticated USING (true);

GRANT ALL ON packing_list_completions TO authenticated;
GRANT ALL ON packing_list_completions TO service_role;

-- =====================================================
-- STORAGE POLICIES FOR TEAMBOX-FILES BUCKET
-- =====================================================
-- Note: storage.objects RLS should already be enabled by Supabase

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read teambox files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for teambox files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload to teambox files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete from teambox files" ON storage.objects;

-- Read access for authenticated users
CREATE POLICY "Allow authenticated read teambox files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'teambox-files');

-- Public read access (for public URLs)
CREATE POLICY "Allow public read teambox files" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'teambox-files');

-- Upload for authenticated users (all authenticated can upload, frontend checks admin)
CREATE POLICY "Allow authenticated upload teambox files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'teambox-files');

-- Delete for authenticated users
CREATE POLICY "Allow authenticated delete teambox files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'teambox-files');

-- =====================================================
-- STORAGE POLICIES FOR GUIDE-IMAGES BUCKET
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated read guide images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read guide images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload guide images" ON storage.objects;

CREATE POLICY "Allow authenticated read guide images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'guide-images');

CREATE POLICY "Allow public read guide images" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'guide-images');

CREATE POLICY "Allow authenticated upload guide images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'guide-images');

-- =====================================================
-- Done! All tables should now have RLS enabled.
-- =====================================================
