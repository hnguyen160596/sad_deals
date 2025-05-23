-- Supabase setup script for Telegram integration
-- Created: May 22, 2025

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main table for storing Telegram messages
CREATE TABLE IF NOT EXISTS telegram_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_message_id BIGINT NOT NULL,
  channel_id TEXT,
  text TEXT,
  date TIMESTAMPTZ,
  price TEXT,
  store TEXT,
  title TEXT,
  links JSONB,
  has_photo BOOLEAN DEFAULT FALSE,
  photo_file_id TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_message_id)
);

-- Table for logging bot runs for monitoring
CREATE TABLE IF NOT EXISTS telegram_bot_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_timestamp TIMESTAMPTZ NOT NULL,
  messages_found INTEGER NOT NULL,
  messages_processed INTEGER NOT NULL,
  success_rate FLOAT NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for logging health checks for monitoring
CREATE TABLE IF NOT EXISTS telegram_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_time TIMESTAMPTZ
);

-- Create the telegram_message_engagement table
CREATE TABLE IF NOT EXISTS telegram_message_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES telegram_messages(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  last_viewed TIMESTAMPTZ,
  last_clicked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create necessary indexes for performance
CREATE INDEX IF NOT EXISTS idx_telegram_message_id ON telegram_messages(telegram_message_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_store ON telegram_messages(store);
CREATE INDEX IF NOT EXISTS idx_telegram_bot_runs_timestamp ON telegram_bot_runs(run_timestamp);
CREATE INDEX IF NOT EXISTS idx_telegram_health_checks_timestamp ON telegram_health_checks(created_at);
CREATE INDEX IF NOT EXISTS telegram_message_engagement_message_id_idx ON telegram_message_engagement(message_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_engagement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS update_telegram_engagement_timestamp ON telegram_message_engagement;
CREATE TRIGGER update_telegram_engagement_timestamp
BEFORE UPDATE ON telegram_message_engagement
FOR EACH ROW
EXECUTE FUNCTION update_telegram_engagement_timestamp();