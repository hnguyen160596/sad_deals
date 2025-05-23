// Telegram Integration Monitoring Function
// This function checks the health of the Telegram integration and attempts recovery

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Initialize database client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Telegram credentials
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Send notification email for critical errors
async function sendErrorNotification(subject, errorDetails) {
  // Skip sending if email settings are not configured
  if (!process.env.NOTIFICATION_EMAIL || !process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
    console.log('Email notification settings not configured, skipping alert');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // or your preferred email service
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `Telegram Integration Alert: ${subject}`,
      html: `
        <h2>Telegram Integration Alert</h2>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Issue:</strong> ${subject}</p>
        <h3>Details:</h3>
        <pre>${JSON.stringify(errorDetails, null, 2)}</pre>
        <p>This is an automated message from your Telegram integration monitoring system.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Alert email sent to ${process.env.NOTIFICATION_EMAIL}`);
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}

// Check if we're receiving new messages
const checkMessageFlow = async () => {
  try {
    // Get the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Count messages from the last 24 hours
    const { data, error, count } = await supabase
      .from('telegram_messages')
      .select('telegram_message_id', { count: 'exact' })
      .gte('created_at', twentyFourHoursAgo.toISOString());

    if (error) throw error;

    return {
      recentMessageCount: count,
      healthy: count > 0, // Consider healthy if we have at least one message in 24h
      lastMessage: data.length > 0 ? data[0] : null
    };
  } catch (error) {
    console.error('Error checking message flow:', error);
    return { healthy: false, error: error.message };
  }
};

// Verify Telegram bot is working correctly
const checkTelegramBot = async () => {
  try {
    // Test the getMe API endpoint to verify bot credentials
    const response = await axios.get(`${TELEGRAM_API}/getMe`);

    if (!response.data || !response.data.ok) {
      return { healthy: false, error: 'Bot credentials invalid' };
    }

    const botInfo = response.data.result;
    return {
      healthy: true,
      botUsername: botInfo.username,
      botId: botInfo.id
    };
  } catch (error) {
    console.error('Error checking Telegram bot:', error);
    return { healthy: false, error: error.message };
  }
};

// Check database connection
const checkDatabase = async () => {
  try {
    // Simple query to verify database connection
    const { data, error } = await supabase
      .from('telegram_messages')
      .select('count(*)', { count: 'exact', head: true });

    if (error) throw error;

    return { healthy: true };
  } catch (error) {
    console.error('Error checking database:', error);
    return { healthy: false, error: error.message };
  }
};

// Attempt to fix common issues
const attemptRecovery = async (issues) => {
  const recoveryResults = {};

  // If database issues, try reconnecting
  if (issues.database) {
    try {
      // Re-initialize the client
      const newSupabase = createClient(supabaseUrl, supabaseKey);
      const testQuery = await newSupabase.from('telegram_messages').select('count(*)', { head: true });
      recoveryResults.database = !testQuery.error;
    } catch (error) {
      recoveryResults.database = false;
    }
  }

  // If message flow issues, try manually running the bot function
  if (issues.messageFlow) {
    try {
      // This would typically call the telegram-bot function directly
      // In a serverless environment, we can make an HTTP request to it
      const response = await axios.post(
        `${process.env.URL}/.netlify/functions/telegram-bot`,
        {},
        { headers: { 'x-recovery-attempt': 'true' } }
      );

      recoveryResults.messageFlow = response.status === 200;
    } catch (error) {
      recoveryResults.messageFlow = false;
    }
  }

  return recoveryResults;
};

// Main health check function
const checkHealth = async () => {
  const messageFlowStatus = await checkMessageFlow();
  const botStatus = await checkTelegramBot();
  const databaseStatus = await checkDatabase();

  const issues = {
    messageFlow: !messageFlowStatus.healthy,
    telegramBot: !botStatus.healthy,
    database: !databaseStatus.healthy
  };

  const hasIssues = Object.values(issues).some(issue => issue);

  let recoveryResults = {};
  if (hasIssues) {
    recoveryResults = await attemptRecovery(issues);
  }

  // Calculate a health score (simple example: 100 if all healthy, 0 if all unhealthy, 33/66 for partial)
  let healthScore = 0;
  const healthyChecks = [messageFlowStatus.healthy, botStatus.healthy, databaseStatus.healthy].filter(Boolean).length;
  if (healthyChecks === 3) healthScore = 100;
  else if (healthyChecks === 2) healthScore = 66;
  else if (healthyChecks === 1) healthScore = 33;
  else healthScore = 0;

  // Compose a lastRunStatus for notification context
  const lastRunStatus = {
    messageFlow: messageFlowStatus,
    telegramBot: botStatus,
    database: databaseStatus,
    issues,
    recovery: hasIssues ? recoveryResults : null
  };

  // Try to get the last successful run timestamp from the health check table
  let lastSuccessfulRun = null;
  try {
    const { data: healthChecks, error } = await supabase
      .from('telegram_health_checks')
      .select('created_at, result')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && healthChecks && healthChecks.length > 0) {
      for (const check of healthChecks) {
        if (check.result && check.result.healthy) {
          lastSuccessfulRun = check.created_at;
          break;
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    healthy: !hasIssues,
    checks: {
      messageFlow: messageFlowStatus,
      telegramBot: botStatus,
      database: databaseStatus
    },
    issues,
    recovery: hasIssues ? recoveryResults : null,
    healthScore,
    lastRunStatus,
    lastSuccessfulRun,
    timestamp: new Date().toISOString()
  };
};

// Main handler for scheduled function
exports.handler = async (event, context) => {
  let healthStatus = null;
  let healthCheckId = null;
  try {
    healthStatus = await checkHealth();

    // Store health check result in database for history
    if (healthStatus.checks.database.healthy) {
      const { data, error } = await supabase.from('telegram_health_checks').insert([{
        result: healthStatus,
        created_at: new Date().toISOString()
      }]).select('id');

      if (!error && data && data.length > 0) {
        healthCheckId = data[0].id;
      }
    }

    // If we have issues, this could trigger an alert via email or webhook
    if (!healthStatus.healthy) {
      console.error('Telegram integration has issues:', JSON.stringify(healthStatus));
    }

    // Send notification email for critical errors (healthScore < 50)
    if (healthStatus.healthScore < 50) {
      await sendErrorNotification('Critical Health Alert', {
        healthScore: healthStatus.healthScore,
        lastRunStatus: healthStatus.lastRunStatus,
        messageFlowStatus: healthStatus.checks.messageFlow,
        dbConnectionStatus: healthStatus.checks.database,
        lastSuccessfulRun: healthStatus.lastSuccessfulRun
      });

      // Log the notification attempt in the health check record if possible
      if (healthCheckId) {
        await supabase
          .from('telegram_health_checks')
          .update({
            notification_sent: true,
            notification_time: new Date().toISOString()
          })
          .eq('id', healthCheckId);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(healthStatus)
    };
  } catch (error) {
    console.error('Error in health check function:', error);

    // Attempt to send a notification for handler-level critical errors
    await sendErrorNotification('Handler Exception', {
      error: error.message,
      stack: error.stack,
      healthStatus
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
