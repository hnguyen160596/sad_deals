# Telegram Integration Deployment Guide

This document provides detailed instructions for setting up the Telegram channel integration for your sales-aholic website. Follow these steps carefully to ensure proper functioning of the Telegram feed.

## Overview

The Telegram integration consists of several components:
1. A Telegram bot that fetches messages from your channel
2. A Supabase database to store the messages
3. Netlify functions that handle the API endpoints
4. Frontend components that display the messages

## Prerequisites

- A Telegram account
- A Telegram channel where you post deals
- A Telegram bot (created through BotFather)
- A Supabase account (free tier is sufficient)
- A Netlify account for deployment

## Step 1: Create a Telegram Bot

1. Open Telegram and search for "BotFather"
2. Start a chat with BotFather and send the command `/newbot`
3. Follow the instructions to create a new bot
   - Choose a name for your bot (e.g., "Sales Aholic Deals Bot")
   - Choose a username for your bot (must end in "bot", e.g., "salesaholic_bot")
4. BotFather will provide you with a bot token - **save this token securely**
5. Optionally, set a description and profile picture for your bot using `/setdescription` and `/setuserpic` commands

## Step 2: Add your Bot to your Channel

1. Open your Telegram channel
2. Go to channel info > Administrators
3. Add Administrator > Search for your bot by username
4. Grant the following permissions:
   - Post messages
   - Read messages
   - Edit messages (optional)
   - Delete messages (optional)

## Step 3: Set up Supabase Database

1. Sign up or log in to [Supabase](https://supabase.com/)
2. Create a new project
3. Once the project is created, navigate to the SQL Editor
4. Run the following SQL to create the necessary tables:

```sql
-- Create table for storing Telegram messages
CREATE TABLE IF NOT EXISTS telegram_messages (
  id SERIAL PRIMARY KEY,
  telegram_message_id BIGINT NOT NULL UNIQUE,
  channel_id TEXT,
  text TEXT,
  date TIMESTAMPTZ NOT NULL,
  price TEXT,
  price_numeric DECIMAL(10,2),
  store TEXT,
  title TEXT NOT NULL,
  links TEXT[],
  has_photo BOOLEAN DEFAULT FALSE,
  photo_file_id TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_store ON telegram_messages(store);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_price_numeric ON telegram_messages(price_numeric);

-- Create table for tracking engagement with Telegram messages
CREATE TABLE IF NOT EXISTS telegram_message_engagement (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES telegram_messages(id),
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  last_viewed TIMESTAMPTZ,
  last_clicked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for tracking bot runs
CREATE TABLE IF NOT EXISTS telegram_bot_runs (
  id SERIAL PRIMARY KEY,
  run_timestamp TIMESTAMPTZ NOT NULL,
  messages_found INTEGER DEFAULT 0,
  messages_processed INTEGER DEFAULT 0,
  success_rate DECIMAL(5,4) DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for health monitoring
CREATE TABLE IF NOT EXISTS telegram_health_checks (
  id SERIAL PRIMARY KEY,
  check_timestamp TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  health_score INTEGER DEFAULT 100,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to extract numeric price from text price
CREATE OR REPLACE FUNCTION extract_price_numeric() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS NOT NULL THEN
    NEW.price_numeric := NULLIF(regexp_replace(NEW.price, '[^0-9.]', '', 'g'), '')::DECIMAL(10,2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update price_numeric whenever price is inserted or updated
CREATE TRIGGER telegram_messages_price_trigger
BEFORE INSERT OR UPDATE ON telegram_messages
FOR EACH ROW EXECUTE FUNCTION extract_price_numeric();
```

5. After running the SQL, go to Project Settings > API
6. Note down your:
   - Project URL (e.g., `https://abcdefghijkl.supabase.co`)
   - API Key (use the "anon/public" key)

## Step 4: Configure Environment Variables in Netlify

1. Log in to your Netlify dashboard
2. Select your site
3. Go to Site settings > Environment variables
4. Add the following environment variables:

```
TELEGRAM_BOT_TOKEN=your_bot_token_from_step_1
TELEGRAM_CHANNEL_ID=@your_channel_username
SUPABASE_URL=your_supabase_project_url_from_step_3
SUPABASE_SERVICE_KEY=your_supabase_anon_key_from_step_3
```

5. Save the changes
6. Redeploy your site to apply the environment variables

## Step 5: Enable Scheduled Functions in Netlify

Ensure that your Netlify site has the scheduled functions plugin enabled:

1. Go to your site's Netlify dashboard
2. Navigate to Integrations > Plugins
3. Look for "Scheduled Functions" plugin
4. If not installed, add it

The `netlify.toml` in your project should already include:

```toml
[[plugins]]
package = "@netlify/plugin-functions-scheduled-functions"
  [plugins.inputs]
    # Telegram bot function to run every 10 minutes
    telegram_bot = "*/10 * * * *"
    # Telegram monitor function to run hourly
    telegram_monitor = "0 * * * *"
```

## Step 6: Verify Installation

1. After deploying, navigate to your site
2. Visit the Telegram Feed test page at `/telegram-feed`
3. Check if the feed is showing messages (may take up to 10 minutes for the first fetch)
4. You can also manually trigger the function by visiting:
   - `/.netlify/functions/telegram-bot` (should return a JSON response)
   - `/.netlify/functions/get-telegram-messages` (should return message data)

## Troubleshooting

If your feed isn't displaying messages:

1. **Check Netlify Function Logs**:
   - Go to Netlify dashboard > Functions
   - Check logs for any errors in the `telegram-bot` or `get-telegram-messages` functions

2. **Verify Bot Permissions**:
   - Ensure your bot has been added to the channel with correct permissions
   - Try posting a test message to your channel

3. **Confirm Database Setup**:
   - Check your Supabase database tables were created properly
   - Verify the connection by viewing the Table Editor in Supabase

4. **Test Environment Variables**:
   - Ensure all environment variables are set correctly in Netlify
   - Check for typos in your bot token or channel ID

5. **Manual Testing**:
   - Try accessing the Telegram API directly to test your bot token:
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe`
   - You should see a JSON response confirming your bot details

## Customization

You can customize the appearance of the Telegram feed components:

- `TelegramFeed.tsx` - For the floating chat-like feed
- `InlineTelegramFeed.tsx` - For the inline feed embedded in a page

Both components are located in the `src/components/` directory.

## Support

If you encounter persistent issues:

1. Check for error messages in the browser console
2. Review the Network tab to see if API requests are failing
3. Look at the Netlify function logs for detailed error information

---

Remember to keep your bot token and API keys secure. Do not share them publicly or commit them to your repository.
