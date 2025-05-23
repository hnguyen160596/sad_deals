// Telegram Integration Status API
// This provides a status summary of the Telegram integration health

const { createClient } = require('@supabase/supabase-js');

// Mock data for development environment
const MOCK_HEALTH_DATA = {
  status: 'healthy',
  healthScore: 92,
  lastChecked: new Date().toISOString(),
  notifications: {
    recentAlerts: [],
    lastNotified: null
  },
  checks: {
    count: 5,
    latest: {
      id: 1,
      result: { healthy: true, healthScore: 92, issues: [] },
      created_at: new Date().toISOString(),
      notification_sent: false
    },
    all: []
  },
  botRuns: {
    count: 10,
    totalMessagesFound: 58,
    totalMessagesProcessed: 58,
    successRate: 1,
    errorCount: 0,
    latestRun: {
      run_timestamp: new Date().toISOString(),
      messages_found: 5,
      messages_processed: 5,
      success_rate: 1,
      error: null
    },
    all: []
  },
  messageStats: {
    last24h: 24,
    total: 1842,
    lastMessageAt: new Date().toISOString()
  },
  lastUpdated: new Date().toISOString()
};

// Initialize database client if credentials are available
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Get a summary of recent health checks, including notification status
const getHealthSummary = async () => {
  // Return mock data if supabase is not initialized
  if (!supabase) {
    console.log("Using mock Telegram health data for development");
    return MOCK_HEALTH_DATA;
  }

  try {
    // Get the 5 most recent health checks, including notification info
    const { data: healthChecks, error: healthError } = await supabase
      .from('telegram_health_checks')
      .select('id, result, created_at, notification_sent, notification_time')
      .order('created_at', { ascending: false })
      .limit(5);

    if (healthError) throw healthError;

    // Get the 10 most recent bot runs
    const { data: botRuns, error: runError } = await supabase
      .from('telegram_bot_runs')
      .select('*')
      .order('run_timestamp', { ascending: false })
      .limit(10);

    if (runError) throw runError;

    // Calculate overall health based on recent results
    const overallHealth = calculateHealth(healthChecks, botRuns);

    // Get message stats for the last 24 hours
    const { data: messageCounts, error: messageError } = await getMessageStats();
    if (messageError) throw messageError;

    // Prepare notification info
    const recentAlerts = healthChecks
      ? healthChecks
          .filter(check => check.notification_sent)
          .map(check => ({
            id: check.id,
            time: check.notification_time,
            score: check.result?.healthScore || 0,
            issues: check.result?.issues || []
          }))
      : [];

    const lastNotified = healthChecks
      ? healthChecks.find(check => check.notification_sent)?.notification_time || null
      : null;

    // Format the response
    return {
      status: overallHealth.healthy ? 'healthy' : 'issues_detected',
      healthScore: overallHealth.score,
      lastChecked: healthChecks && healthChecks.length > 0 ? healthChecks[0].created_at : null,
      notifications: {
        recentAlerts,
        lastNotified
      },
      checks: {
        count: healthChecks ? healthChecks.length : 0,
        latest: healthChecks && healthChecks.length > 0 ? healthChecks[0] : null,
        all: healthChecks || []
      },
      botRuns: summarizeBotRuns(botRuns),
      messageStats: messageCounts,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting health summary:', error);
    return {
      status: 'error',
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Calculate overall health score
const calculateHealth = (healthChecks, botRuns) => {
  // Start with perfect score
  let score = 100;
  let healthy = true;

  // If no health checks, that's a problem
  if (!healthChecks || healthChecks.length === 0) {
    return { healthy: false, score: 0 };
  }

  // Check most recent health check
  const latestHealth = healthChecks[0].result;
  if (!latestHealth.healthy) {
    score -= 50;
    healthy = false;
  }

  // Check bot runs
  if (botRuns && botRuns.length > 0) {
    // Calculate average success rate of recent runs
    const successRates = botRuns.map(run => run.success_rate || 0);
    const avgSuccessRate = successRates.reduce((a, b) => a + b, 0) / successRates.length;

    // Deduct points for low success rates
    if (avgSuccessRate < 0.5) {
      score -= 40;
      healthy = false;
    } else if (avgSuccessRate < 0.8) {
      score -= 20;
      healthy = avgSuccessRate >= 0.7; // Only somewhat unhealthy
    }

    // Check for errors in recent runs
    const recentErrors = botRuns.filter(run => run.error).length;
    if (recentErrors > 3) {
      score -= 30;
      healthy = false;
    } else if (recentErrors > 0) {
      score -= 10 * recentErrors;
      healthy = recentErrors < 3; // Allow a couple errors
    }
  } else {
    // No bot runs is concerning
    score -= 40;
    healthy = false;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return { healthy, score };
};

// Summarize bot runs into useful stats
const summarizeBotRuns = (botRuns) => {
  if (!botRuns || botRuns.length === 0) {
    return { count: 0 };
  }

  const totalMessages = botRuns.reduce((sum, run) => sum + run.messages_found, 0);
  const processedMessages = botRuns.reduce((sum, run) => sum + run.messages_processed, 0);
  const errorCount = botRuns.filter(run => run.error).length;

  return {
    count: botRuns.length,
    totalMessagesFound: totalMessages,
    totalMessagesProcessed: processedMessages,
    successRate: totalMessages > 0 ? processedMessages / totalMessages : 1,
    errorCount: errorCount,
    latestRun: botRuns[0],
    all: botRuns
  };
};

// Get message stats for the past 24 hours
const getMessageStats = async () => {
  if (!supabase) {
    return {
      last24h: 24,
      total: 1842,
      lastMessageAt: new Date().toISOString()
    }
  }

  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get count of messages in last 24 hours
    const { count: recentCount, error: recentError } = await supabase
      .from('telegram_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString());

    if (recentError) throw recentError;

    // Get total message count
    const { count: totalCount, error: totalError } = await supabase
      .from('telegram_messages')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get latest message
    const { data: latestMessages, error: latestError } = await supabase
      .from('telegram_messages')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (latestError) throw latestError;

    return {
      last24h: recentCount || 0,
      total: totalCount || 0,
      lastMessageAt: latestMessages.length > 0 ? latestMessages[0].created_at : null
    };
  } catch (error) {
    console.error('Error getting message stats:', error);
    return { error: error.message };
  }
};

// Main handler
exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Add basic authentication for production
  // This is a simplified check - implement proper auth for production
  const authHeader = event.headers.authorization;
  const isAdminRequest = event.queryStringParameters?.admin === 'true';

  if (isAdminRequest && (!authHeader || !authHeader.startsWith('Bearer '))) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // Enable CORS for frontend access
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    const summary = await getHealthSummary();

    // For non-admin requests, return a simplified status
    if (!isAdminRequest) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: summary.status,
          healthScore: summary.healthScore,
          messageCount: summary.messageStats?.last24h || 0,
          lastUpdated: summary.lastUpdated
        })
      };
    }

    // Full details for admin requests
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(summary)
    };
  } catch (error) {
    console.error('Error in status function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ status: 'error', error: error.message })
    };
  }
};
