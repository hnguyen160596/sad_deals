/**
 * Setup Database Schema for Telegram Integration
 */
const { createClient } = require('@supabase/supabase-js');

// Initialize database client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create stored procedures for database operations
async function createStoredProcedures(supabase) {
  console.log('Creating stored procedures...');

  // Create a procedure to add a column if it doesn't exist
  const addColumnSql = `
    CREATE OR REPLACE FUNCTION add_column_if_not_exists(
      _table_name text,
      _column_name text,
      _column_def text
    )
    RETURNS void AS $$
    DECLARE
      _column_exists boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = _table_name
        AND column_name = _column_name
      ) INTO _column_exists;

      IF NOT _column_exists THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', _table_name, _column_name, _column_def);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Create a procedure to create a table if it doesn't exist
  const createTableSql = `
    CREATE OR REPLACE FUNCTION create_table_if_not_exists(
      table_name text,
      column_defs text
    )
    RETURNS void AS $$
    DECLARE
      _table_exists boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = table_name
      ) INTO _table_exists;

      IF NOT _table_exists THEN
        EXECUTE format('CREATE TABLE %I (%s)', table_name, column_defs);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Create a procedure to increment a counter
  const incrementCounterSql = `
    CREATE OR REPLACE FUNCTION increment_counter(
      row_id UUID,
      counter_name TEXT,
      table_name TEXT,
      increment_by INTEGER DEFAULT 1
    )
    RETURNS INTEGER AS $$
    DECLARE
      current_value INTEGER;
      new_value INTEGER;
    BEGIN
      EXECUTE format('SELECT %I FROM %I WHERE id = $1', counter_name, table_name)
      INTO current_value
      USING row_id;

      IF current_value IS NULL THEN
        current_value := 0;
      END IF;

      new_value := current_value + increment_by;

      EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, counter_name)
      USING new_value, row_id;

      RETURN new_value;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    // Execute the SQL to create the procedures
    await supabase.rpc('exec_sql', { sql: addColumnSql });
    await supabase.rpc('exec_sql', { sql: createTableSql });
    await supabase.rpc('exec_sql', { sql: incrementCounterSql });
    console.log('Created stored procedures successfully');
    console.log('Created increment_counter function successfully');
    return true;
  } catch (error) {
    // If the exec_sql function doesn't exist, create it first
    if (error.message && error.message.includes("function \"exec_sql\"")) {
      console.log('Creating exec_sql function first...');
      try {
        const execSqlFn = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql;
        `;

        // Try using raw SQL queries since we can't use RPC yet
        const { error: sqlError } = await supabase.from('_exec_sql').select('*').limit(1);
        if (sqlError && sqlError.message.includes('relation "_exec_sql" does not exist')) {
          // Create a temp table to run the SQL
          await supabase.rpc('exec_sql', {
            sql: 'CREATE TEMPORARY TABLE _exec_sql (id serial PRIMARY KEY)'
          });

          // Now create our function
          await supabase.rpc('exec_sql', { sql: execSqlFn });

          // Try creating the stored procedures again
          return await createStoredProcedures(supabase);
        }

        console.error('Failed to create exec_sql function:', sqlError);
        return false;
      } catch (err) {
        console.error('Error creating exec_sql function:', err);
        return false;
      }
    }

    console.error('Error creating stored procedures:', error);
    return false;
  }
}

// Function to create the necessary database tables
const setupDatabase = async () => {
  try {
    // Create stored procedures first
    await createStoredProcedures(supabase);

    // Check if the telegram_messages table exists and create it if it doesn't
    const { error: tableExistsError } = await supabase
      .from('telegram_messages')
      .select('count(*)')
      .limit(1)
      .single();

    if (tableExistsError) {
      console.log('Table does not exist, creating...');

      // Create all the necessary tables using SQL
      const { error: createTableError } = await supabase.rpc('create_telegram_tables', {
        sql: `
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

          -- Create necessary indexes
          CREATE INDEX IF NOT EXISTS idx_telegram_message_id ON telegram_messages(telegram_message_id);
          CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date);
          CREATE INDEX IF NOT EXISTS idx_telegram_messages_store ON telegram_messages(store);
          CREATE INDEX IF NOT EXISTS idx_telegram_bot_runs_timestamp ON telegram_bot_runs(run_timestamp);
          CREATE INDEX IF NOT EXISTS idx_telegram_health_checks_timestamp ON telegram_health_checks(created_at);
        `
      });

      if (createTableError) {
        throw new Error(`Error creating table: ${createTableError.message}`);
      }

      console.log('Table created successfully');
    } else {
      console.log('Table already exists');

      // Check if telegram_health_checks table exists and update columns if needed
      const { data: healthCheckData, error: healthCheckError } = await supabase
        .from('telegram_health_checks')
        .select('id')
        .limit(1);

      if (healthCheckError || !healthCheckData || healthCheckData.length === 0) {
        console.log('Creating telegram_health_checks table...');
        const { error } = await supabase.rpc('create_table_if_not_exists', {
          table_name: 'telegram_health_checks',
          column_defs: `
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            result jsonb,
            created_at timestamp with time zone DEFAULT now(),
            notification_sent boolean DEFAULT false,
            notification_time timestamp with time zone
          `
        });

        if (error) {
          console.error('Error creating telegram_health_checks table:', error);
          return { success: false, message: 'Failed to create health checks table', error };
        }
      } else {
        console.log('telegram_health_checks table already exists, checking for column updates...');

        // Check if notification_sent column exists and add if not
        const { error: columnCheckError } = await supabase.rpc('add_column_if_not_exists', {
          table_name: 'telegram_health_checks',
          column_name: 'notification_sent',
          column_def: 'boolean DEFAULT false'
        });

        if (columnCheckError) {
          console.error('Error checking/adding notification_sent column:', columnCheckError);
        }

        // Check if notification_time column exists and add if not
        const { error: timeColumnError } = await supabase.rpc('add_column_if_not_exists', {
          table_name: 'telegram_health_checks',
          column_name: 'notification_time',
          column_def: 'timestamp with time zone'
        });

        if (timeColumnError) {
          console.error('Error checking/adding notification_time column:', timeColumnError);
        }
      }
    }

    // Create the telegram_message_engagement table
    console.log('Setting up telegram_message_engagement table...');
    const { data: engagementData, error: engagementError } = await supabase
      .from('telegram_message_engagement')
      .select('id')
      .limit(1);

    if (engagementError || !engagementData || !engagementData.length) {
      console.log('Creating telegram_message_engagement table...');

      // Execute the SQL to create the engagement table
      const engagementTableSql = `
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

        -- Index for faster lookups by message_id
        CREATE INDEX IF NOT EXISTS telegram_message_engagement_message_id_idx
        ON telegram_message_engagement(message_id);

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
      `;

      try {
        await supabase.rpc('exec_sql', { sql: engagementTableSql });
        console.log('Created telegram_message_engagement table successfully');
      } catch (error) {
        console.error('Error creating telegram_message_engagement table:', error);
        return { success: false, message: 'Failed to create message engagement table', error };
      }
    } else {
      console.log('telegram_message_engagement table already exists');
    }

    return { success: true, message: 'Database setup complete' };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, error: error.message };
  }
};

exports.handler = async (event, context) => {
  // Only allow POST requests with proper authorization for security
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // In production, implement proper authorization check
  // Simplified here for documentation
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const result = await setupDatabase();

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in setup function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
