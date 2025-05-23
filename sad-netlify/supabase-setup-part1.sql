-- Supabase setup script for Telegram integration (Part 1)
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