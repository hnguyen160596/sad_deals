# Telegram Channel Integration

This guide explains how to set up the 24/7 automatic Telegram channel forwarder that displays content from your Telegram channel directly in the website's live feed.

## Overview

The integration uses:
- Telegram Bot API
- Netlify Functions (serverless)
- Scheduled Functions for 24/7 operation
- Supabase database for message storage

No manual intervention, bash commands, or admin logins are required once the system is set up.

## Prerequisites

1. Telegram API credentials (already configured)
2. Supabase account (for database)
3. Netlify account (for hosting and serverless functions)

## Initial Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and service key from the API section
3. Add these credentials to your environment variables:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_service_key
   ```

### 2. Set up your Telegram Bot

1. Your Telegram API credentials are already configured in `.env`:
   ```
   TELEGRAM_APP_ID=22964226
   TELEGRAM_API_HASH=52dfdd4bcc369cdfd54a880b38535220
   TELEGRAM_BOT_USERNAME=telegrambot
   ```

2. Create a bot token via Telegram's @BotFather if you don't already have one
3. Add the bot to your channel as an administrator
4. Get your channel ID (can be found in channel URL or using a Telegram ID bot)
5. Add these to your `.env` file:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHANNEL_ID=your_channel_id
   ```

### 3. Create the Database Tables

1. Deploy your site to Netlify
2. Run the setup-database function manually once:
   ```
   curl -X POST https://your-site.netlify.app/.netlify/functions/setup-database \
   -H "Authorization: Bearer your_secret_token"
   ```
   Or use the Netlify dashboard to run the function manually

## How It Works

1. **Telegram Bot**: The `telegram-bot.js` function runs every 5 minutes via Netlify scheduled functions, fetching any new messages from your Telegram channel.

2. **Message Processing**: Each message is processed to extract:
   - Product title and price
   - Links and images
   - Store information
   - Other relevant details

3. **Storage**: Messages are stored in your Supabase database.

4. **Display**: The `InlineTelegramFeed` component fetches these messages from the API endpoint and displays them in the live feed.

5. **Real-time Updates**: The UI polls for new messages every 60 seconds, showing a notification when new content is available.

## Adding Content to the Feed

Simply post to your Telegram channel as normal! Content should include:
- Product images
- Price (format as $XX.XX for best automatic extraction)
- Product title
- Product URL (preferably with your affiliate tag)
- Optional store name (e.g., "Amazon", "Walmart")

## Troubleshooting

### Messages Not Appearing

1. Check Netlify Function logs for errors
2. Verify your Telegram bot has access to channel messages
3. Ensure your database credentials are correct
4. Confirm the bot function is running on schedule (check Netlify scheduled functions dashboard)

### Image Issues

1. Make sure your bot has access to files in the channel
2. Check if Telegram API is throttling your requests
3. Verify file URLs are correctly formatted

## Advanced Configuration

The system can be further customized by:

1. Editing `telegram-bot.js` to modify the message processing logic
2. Updating `get-telegram-messages.js` to change the API response format
3. Modifying `InlineTelegramFeed.tsx` for UI changes

## Security Considerations

1. Keep your API keys and tokens secure
2. Use proper authorization for your API endpoints
3. Consider rate limiting to prevent abuse

## Monitoring and Maintenance

The system is designed to run 24/7 without intervention. It includes an automated monitoring system that:

1. Runs hourly health checks via the `telegram-monitor` function
2. Tracks successful message processing rates
3. Automatically attempts to recover from common issues
4. Logs all activity for later review

### Health Monitoring Features

- **Continuous Health Checking**: The monitoring system verifies that messages are flowing, the Telegram bot is responsive, and the database connection is operational.
- **Automatic Recovery**: When issues are detected, the system attempts self-recovery through reconnection and retries.
- **Historical Logging**: All health checks and bot runs are recorded in the database for trend analysis.

### Access Monitoring Data

You can view monitoring data through these methods:

1. **Netlify Function Logs**: Check the logs for the `telegram-monitor` and `telegram-bot` functions
2. **Supabase Database**: Query the `telegram_health_checks` and `telegram_bot_runs` tables
3. **API Endpoint**: Use `/api/telegram-status` to get a summary of system health (useful for admin dashboards)

No manual intervention is required for day-to-day operation once the system is set up correctly.

## Advanced Monitoring and Analytics

### Notification System

The monitoring system now includes email notifications for critical errors:

1. **Email Alerts**: Automatic email notifications when critical issues are detected.
2. **Configurable Settings**: Set notification thresholds and recipient emails.
3. **Detailed Reports**: Email contains specifics on what failed and diagnostics information.

To enable email notifications, add these environment variables:
```
NOTIFICATION_EMAIL=your_notification_email@example.com
EMAIL_FROM=your_sending_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

### User Engagement Tracking

The system now tracks user engagement with Telegram messages:

1. **View Tracking**: Automatically records when messages are displayed to users.
2. **Click Tracking**: Monitors when users click on message links.
3. **Save/Share Actions**: Tracks when users save or share deals.
4. **Analytics API**: Provides detailed engagement metrics through `/api/telegram-analytics`.

### Analytics Dashboard

Advanced analytics are available through the admin dashboard:

1. **Performance Metrics**: See which messages get the most views, clicks, and saves.
2. **Engagement Rates**: Track click-through rates and conversion metrics.
3. **Time-based Analysis**: Filter analytics by day, week, month, or year.
4. **Top Performers**: Identify your most successful deals and content formats.

Access the analytics API at `/api/telegram-analytics?timeframe=week` with optional parameters:
- `timeframe`: day, week, month, year, all (default: all)
- `limit`: number of messages to include (default: 20, max: 100)

### Content Optimization

Use the analytics to optimize your content strategy:

1. **Identify Patterns**: What deal types get the most engagement?
2. **Best Times**: When do users most actively engage with your content?
3. **Store Performance**: Which stores' deals perform best with your audience?
4. **Price Point Analysis**: Analyze which price points drive the most user action.

All of these features are available without manual intervention, ensuring 24/7 automated operation.
