-- Update video_assets table to match normalized data structure with singular field names
ALTER TABLE video_assets 
  RENAME COLUMN protocols TO protocol;

ALTER TABLE video_assets 
  RENAME COLUMN codecs TO codec;

-- Add any missing columns if needed
ALTER TABLE video_assets 
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb;

-- Update the table comment
COMMENT ON TABLE video_assets IS 'Video test assets with normalized schema using singular field names';
