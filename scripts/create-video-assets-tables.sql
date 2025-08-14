-- Create video assets tables in Supabase
-- Creating comprehensive schema for video test assets

-- Video assets table
CREATE TABLE IF NOT EXISTS video_assets (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  host TEXT NOT NULL,
  scheme TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  protocols JSONB NOT NULL DEFAULT '[]',
  codecs JSONB NOT NULL DEFAULT '[]',
  resolution JSONB,
  hdr TEXT DEFAULT 'sdr',
  container TEXT,
  notes TEXT DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facet counts table for caching
CREATE TABLE IF NOT EXISTS facet_counts (
  id SERIAL PRIMARY KEY,
  facet_type TEXT NOT NULL,
  facet_value TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(facet_type, facet_value)
);

-- Metadata table
CREATE TABLE IF NOT EXISTS asset_metadata (
  id SERIAL PRIMARY KEY,
  total_assets INTEGER NOT NULL,
  build_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  source_url TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_assets_host ON video_assets(host);
CREATE INDEX IF NOT EXISTS idx_video_assets_category ON video_assets(category);
CREATE INDEX IF NOT EXISTS idx_video_assets_hdr ON video_assets(hdr);
CREATE INDEX IF NOT EXISTS idx_video_assets_container ON video_assets(container);
CREATE INDEX IF NOT EXISTS idx_video_assets_protocols ON video_assets USING GIN(protocols);
CREATE INDEX IF NOT EXISTS idx_video_assets_codecs ON video_assets USING GIN(codecs);
CREATE INDEX IF NOT EXISTS idx_video_assets_features ON video_assets USING GIN(features);

-- Function to update facet counts
CREATE OR REPLACE FUNCTION update_facet_counts()
RETURNS VOID AS $$
BEGIN
  -- Clear existing counts
  DELETE FROM facet_counts;
  
  -- Insert protocol counts
  INSERT INTO facet_counts (facet_type, facet_value, count)
  SELECT 'protocols', protocol, COUNT(*)
  FROM video_assets, jsonb_array_elements_text(protocols) AS protocol
  GROUP BY protocol;
  
  -- Insert codec counts
  INSERT INTO facet_counts (facet_type, facet_value, count)
  SELECT 'codecs', codec, COUNT(*)
  FROM video_assets, jsonb_array_elements_text(codecs) AS codec
  GROUP BY codec;
  
  -- Insert resolution counts
  INSERT INTO facet_counts (facet_type, facet_value, count)
  SELECT 'resolutions', resolution->>'label', COUNT(*)
  FROM video_assets
  WHERE resolution IS NOT NULL AND resolution->>'label' IS NOT NULL
  GROUP BY resolution->>'label';
  
  -- Insert HDR counts
  INSERT INTO facet_counts (facet_type, facet_value, count)
  SELECT 'hdr', hdr, COUNT(*)
  FROM video_assets
  GROUP BY hdr;
  
  -- Insert container counts
  INSERT INTO facet_counts (facet_type, facet_value, count)
  SELECT 'containers', container, COUNT(*)
  FROM video_assets
  WHERE container IS NOT NULL
  GROUP BY container;
  
  -- Insert host counts
  INSERT INTO facet_counts (facet_type, facet_value, count)
  SELECT 'hosts', host, COUNT(*)
  FROM video_assets
  GROUP BY host;
  
  -- Insert scheme counts
  INSERT INTO facet_counts (facet_type, facet_value, count)
  SELECT 'schemes', scheme, COUNT(*)
  FROM video_assets
  GROUP BY scheme;
END;
$$ LANGUAGE plpgsql;
