# Telegram Integration Troubleshooting Guide

This guide provides solutions for common issues with the Telegram integration, especially focusing on 502 Bad Gateway errors when deploying to Netlify.

## Understanding 502 Bad Gateway Errors

A 502 Bad Gateway error typically indicates:
1. Your Netlify function is timing out
2. The function is running out of memory
3. The function is failing to connect to external services
4. The function is throwing an unhandled error

## Prerequisites Check

Before diving into specific issues, ensure you have:

- [ ] A valid Telegram bot token (created through BotFather)
- [ ] Your bot added to your Telegram channel with proper admin permissions
- [ ] A Supabase account with a project set up
- [ ] Netlify account with proper environment variables configured

## 1. Supabase Configuration Issues

### Problem: Incorrect Supabase Credentials

The most common source of 502 errors is incorrect Supabase configuration.

#### Symptoms:
- Functions return 502 errors
- Error logs mention "Failed to connect to Supabase"
- Database operations fail

#### Solutions:

1. **Check Environment Variables**

   Ensure these environment variables are set correctly in your Netlify dashboard:

   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-anon-key
   ```

   > 🚨 **IMPORTANT**: Do not use the PostgreSQL connection string (DATABASE_URL) for Supabase initialization. The Supabase client requires the project URL and anon key.

2. **Verify Supabase Values**

   - Go to your Supabase project dashboard
   - Click "Project Settings" > "API"
   - Copy the URL under "Project URL"
   - Copy the key labeled "anon public" under "Project API keys"
   - Update your Netlify environment variables with these exact values

3. **Redeploy after Changes**

   After updating environment variables in Netlify, you must redeploy your site for the changes to take effect:

   ```bash
   netlify deploy --prod
   ```

### Problem: Database Schema Not Set Up

#### Symptoms:
- Errors about "relation does not exist"
- Messages aren't being stored or retrieved

#### Solution:

1. Run the database setup function manually:

   ```
   curl -X POST https://your-netlify-site.netlify.app/.netlify/functions/setup-database \
   -H "Authorization: Bearer testtoken" \
   -H "Content-Type: application/json"
   ```

2. Verify tables are created in Supabase:
   - Go to Supabase Dashboard > Table Editor
   - You should see `telegram_messages`, `telegram_message_engagement`, and other tables

## 2. Telegram API Issues

### Problem: Invalid Bot Token or Permissions

#### Symptoms:
- Error logs containing "Unauthorized" or "Forbidden" from Telegram API
- Bot not receiving or forwarding messages

#### Solutions:

1. **Test Your Bot Token**

   Visit this URL in your browser (replace with your actual token):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
   ```

   You should see a JSON response like:
   ```json
   {"ok":true,"result":{"id":1234567890,"is_bot":true,"first_name":"Your Bot Name"}}
   ```

   If you see `{"ok":false}`, your token is invalid or revoked.

2. **Verify Bot Permissions**

   - Open your Telegram channel
   - Go to channel info > Administrators
   - Check that your bot is listed as admin
   - Ensure it has these permissions:
     - Post messages
     - Edit messages
     - Delete messages

3. **Re-create Bot Token if Needed**

   If your bot token doesn't work, create a new one:
   - Chat with BotFather on Telegram
   - Send `/revoke` command
   - Select your bot
   - Get new token and update in Netlify environment variables

## 3. Netlify Function Issues

### Problem: Function Timeouts

Netlify functions have a default timeout of 10 seconds, which might be too short for complex operations.

#### Symptoms:
- Functions that work locally fail on Netlify with 502 errors
- Error logs showing "Function execution timed out"

#### Solutions:

1. **Increase Function Timeout**

   Add this to your `netlify.toml` file:

   ```toml
   [functions]
     timeout = 30
   ```

2. **Optimize Function Performance**

   - Use caching for expensive operations
   - Reduce database queries
   - Implement pagination for large datasets

### Problem: Memory Limitations

#### Symptoms:
- Functions crash with no clear error
- 502 errors with high memory usage

#### Solution:

Increase function memory limit in `netlify.toml`:

```toml
[functions]
  memory = 1024 # Increase to 1GB if needed
```

### Problem: Scheduled Functions Not Running

#### Symptoms:
- Telegram feed not updating automatically
- No errors, but no new content

#### Solutions:

1. **Verify Scheduled Functions Plugin**

   Check your `netlify.toml` includes:

   ```toml
   [[plugins]]
   package = "@netlify/plugin-functions-scheduled-functions"
     [plugins.inputs]
       telegram_bot = "*/10 * * * *"
   ```

2. **Enable Build Plugin**

   - Go to Netlify Dashboard > Site settings > Build & deploy > Build plugins
   - Ensure "Functions Scheduled Functions" is enabled

3. **Trigger Function Manually for Testing**

   Visit:
   ```
   https://your-site.netlify.app/.netlify/functions/telegram-bot
   ```

## 4. Testing Locally Before Deploying

Local testing helps identify issues before deployment.

### Setting Up Local Testing

1. **Create a .env.local file**

   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHANNEL_ID=@your_channel_username
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_anon_key
   ```

2. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

3. **Run Functions Locally**

   ```bash
   netlify dev
   ```

4. **Test Specific Functions**

   ```bash
   curl http://localhost:8888/.netlify/functions/telegram-bot
   curl http://localhost:8888/.netlify/functions/get-telegram-messages
   ```

## 5. Debugging 502 Errors

When facing 502 errors, follow this step-by-step debugging approach:

### Step 1: Check Netlify Function Logs

1. Go to Netlify dashboard > Functions
2. Find the failing function (e.g., `telegram-bot` or `get-telegram-messages`)
3. View logs for error messages

### Step 2: Test API Endpoints Directly

Use a tool like Postman or cURL to test the endpoints:

```bash
curl https://your-site.netlify.app/.netlify/functions/get-telegram-messages
```

### Step 3: Verify Environment Variables

1. Go to Netlify dashboard > Site settings > Environment variables
2. Ensure all required variables are set correctly:
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHANNEL_ID
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY

### Step 4: Check External Service Status

- Verify Supabase is up: https://status.supabase.com/
- Check Telegram API status by testing with a simple API call

## 6. Common Error Patterns and Solutions

### Error: "Failed to obtain getUpdates response from Telegram"

**Solution:** This usually indicates a network issue or invalid bot token. Verify your bot token and try using a VPN if you're in a region that might restrict Telegram.

### Error: "Failed to connect to Supabase"

**Solution:** Double check your Supabase URL and key. The URL should be in the format `https://xxx.supabase.co` and the key should start with `eyJh...`.

### Error: "Foreign key violation" or "Relation does not exist"

**Solution:** Your database schema is likely not set up correctly. Run the setup-database function manually.

### Error: "Memory usage exceeded"

**Solution:** Your function is using too much memory. Optimize your code or increase the memory limit in `netlify.toml`.

## 7. Quick Reference: Essential Environment Variables

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| TELEGRAM_BOT_TOKEN | Your Telegram bot's API token | `7708700477:AAHO96EDKHXDC91BGgUAruF505NlIqhXkyU` |
| TELEGRAM_CHANNEL_ID | ID or username of your channel | `@salesahoclic` |
| SUPABASE_URL | Supabase project URL | `https://example.supabase.co` |
| SUPABASE_SERVICE_KEY | Supabase anon/public key | `eyJhbGc...` |