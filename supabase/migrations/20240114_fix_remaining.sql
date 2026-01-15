-- Create packing_list_completions table if it doesn't exist
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

CREATE INDEX IF NOT EXISTS idx_packing_completions_activity ON packing_list_completions(activity);
CREATE INDEX IF NOT EXISTS idx_packing_completions_date ON packing_list_completions(completed_at);

-- Enable RLS on packing_list_completions
ALTER TABLE packing_list_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read packing_list_completions" ON packing_list_completions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert packing_list_completions" ON packing_list_completions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated delete packing_list_completions" ON packing_list_completions FOR DELETE TO authenticated USING (true);

-- STORAGE POLICIES FOR TEAMBOX-FILES
DROP POLICY IF EXISTS "Allow authenticated read teambox files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read teambox files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload teambox files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete teambox files" ON storage.objects;
DROP POLICY IF EXISTS "teambox_files_select_auth" ON storage.objects;
DROP POLICY IF EXISTS "teambox_files_select_anon" ON storage.objects;
DROP POLICY IF EXISTS "teambox_files_insert" ON storage.objects;
DROP POLICY IF EXISTS "teambox_files_delete" ON storage.objects;

CREATE POLICY "teambox_files_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'teambox-files');
CREATE POLICY "teambox_files_select_anon" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'teambox-files');
CREATE POLICY "teambox_files_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'teambox-files');
CREATE POLICY "teambox_files_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'teambox-files');

-- STORAGE POLICIES FOR GUIDE-IMAGES
DROP POLICY IF EXISTS "guide_images_select_auth" ON storage.objects;
DROP POLICY IF EXISTS "guide_images_select_anon" ON storage.objects;
DROP POLICY IF EXISTS "guide_images_insert" ON storage.objects;

CREATE POLICY "guide_images_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'guide-images');
CREATE POLICY "guide_images_select_anon" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'guide-images');
CREATE POLICY "guide_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'guide-images');
