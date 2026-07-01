
CREATE POLICY "Users read own pest scans" ON storage.objects FOR SELECT
  USING (bucket_id = 'pest-scans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own pest scans" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pest-scans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own pest scans" ON storage.objects FOR DELETE
  USING (bucket_id = 'pest-scans' AND auth.uid()::text = (storage.foldername(name))[1]);
