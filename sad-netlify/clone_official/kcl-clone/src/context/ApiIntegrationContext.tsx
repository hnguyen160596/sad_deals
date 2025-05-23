import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, PERMISSIONS } from './UserContext';

// API integration status types
export type ApiStatus = 'connected' | 'disconnected' | 'error' | 'pending';

// Integration types with their specific configurations
export interface ApiIntegration {
  id: string;
  name: string;
  type: 'payment' | 'shipping' | 'analytics' | 'marketing' | 'social' | 'crm' | 'other';
  description: string;
  status: ApiStatus;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  baseUrl?: string;
  endpoints?: ApiEndpoint[];
  webhooks?: ApiWebhook[];
  lastSynced?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isEnabled: boolean;
  config: Record<string, any>;
  logs: ApiLog[];
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

// API Endpoint configuration
export interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  parameters?: Record<string, any>;
  headers?: Record<string, string>;
  description?: string;
  isActive: boolean;
  lastUsed?: string;
}

// Webhook configuration
export interface ApiWebhook {
  id: string;
  name: string;
  event: string;
  url: string;
  isActive: boolean;
  secret?: string;
  createdAt: string;
  lastTriggered?: string;
  failureCount: number;
}

// API Log entry
export interface ApiLog {
  id: string;
  timestamp: string;
  operation: string;
  endpoint?: string;
  status: 'success' | 'error';
  responseTime?: number;
  requestData?: string;
  responseData?: string;
  errorMessage?: string;
}

// OAuth configuration
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scope: string[];
}

// API Keys configuration
export interface ApiKeyConfig {
  apiKey: string;
  apiSecret?: string;
}

// Context interface
interface ApiIntegrationContextType {
  integrations: ApiIntegration[];
  isLoading: boolean;
  error: string | null;

  // Integration Management
  addIntegration: (integration: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => ApiIntegration;
  updateIntegration: (id: string, updates: Partial<ApiIntegration>) => boolean;
  deleteIntegration: (id: string) => boolean;
  getIntegrationById: (id: string) => ApiIntegration | undefined;
  getIntegrationsByType: (type: ApiIntegration['type']) => ApiIntegration[];

  // Connection Management
  connectApi: (id: string, config: ApiKeyConfig | OAuthConfig) => Promise<boolean>;
  disconnectApi: (id: string) => boolean;
  testConnection: (id: string) => Promise<{ success: boolean; message: string }>;

  // Endpoint Management
  addEndpoint: (integrationId: string, endpoint: Omit<ApiEndpoint, 'id'>) => boolean;
  updateEndpoint: (integrationId: string, endpointId: string, updates: Partial<ApiEndpoint>) => boolean;
  deleteEndpoint: (integrationId: string, endpointId: string) => boolean;

  // Webhook Management
  addWebhook: (integrationId: string, webhook: Omit<ApiWebhook, 'id' | 'createdAt'>) => boolean;
  updateWebhook: (integrationId: string, webhookId: string, updates: Partial<ApiWebhook>) => boolean;
  deleteWebhook: (integrationId: string, webhookId: string) => boolean;
  testWebhook: (integrationId: string, webhookId: string) => Promise<boolean>;

  // Log Management
  getLogs: (integrationId: string, limit?: number) => ApiLog[];
  clearLogs: (integrationId: string) => boolean;

  // Data Operations
  executeEndpoint: (
    integrationId: string,
    endpointId: string,
    data?: any
  ) => Promise<{ success: boolean; data?: any; error?: string }>;

  syncData: (integrationId: string) => Promise<boolean>;
}

// Create the context with default values
const ApiIntegrationContext = createContext<ApiIntegrationContextType>({
  integrations: [],
  isLoading: false,
  error: null,

  addIntegration: () => ({} as ApiIntegration),
  updateIntegration: () => false,
  deleteIntegration: () => false,
  getIntegrationById: () => undefined,
  getIntegrationsByType: () => [],

  connectApi: async () => false,
  disconnectApi: () => false,
  testConnection: async () => ({ success: false, message: '' }),

  addEndpoint: () => false,
  updateEndpoint: () => false,
  deleteEndpoint: () => false,

  addWebhook: () => false,
  updateWebhook: () => false,
  deleteWebhook: () => false,
  testWebhook: async () => false,

  getLogs: () => [],
  clearLogs: () => false,

  executeEndpoint: async () => ({ success: false }),
  syncData: async () => false,
});

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Main provider component
export const ApiIntegrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, hasPermission } = useUser();
  const [integrations, setIntegrations] = useState<ApiIntegration[]>(() => {
    const savedIntegrations = localStorage.getItem('apiIntegrations');
    if (savedIntegrations) {
      return JSON.parse(savedIntegrations);
    }

    // Sample integrations for demo
    return [
      {
        id: '1',
        name: 'Stripe Payments',
        type: 'payment',
        description: 'Online payment processing for internet businesses',
        status: 'connected',
        baseUrl: 'https://api.stripe.com/v1',
        apiKey: 'sk_test_**********************',
        createdAt: new Date('2025-01-15').toISOString(),
        updatedAt: new Date('2025-05-01').toISOString(),
        createdBy: '1', // Admin user ID
        isEnabled: true,
        lastSynced: new Date('2025-05-20').toISOString(),
        config: {
          webhookSecret: 'whsec_**********************',
          currency: 'USD',
          paymentMethods: ['card', 'bank_transfer'],
        },
        endpoints: [
          {
            id: '101',
            name: 'Get Customers',
            path: '/customers',
            method: 'GET',
            isActive: true,
            lastUsed: new Date('2025-05-19').toISOString()
          },
          {
            id: '102',
            name: 'Create Payment',
            path: '/payment_intents',
            method: 'POST',
            isActive: true,
            lastUsed: new Date('2025-05-20').toISOString()
          }
        ],
        webhooks: [
          {
            id: '201',
            name: 'Payment Succeeded',
            event: 'payment_intent.succeeded',
            url: 'https://salesaholicsdeals.com/api/webhooks/stripe/payment-success',
            isActive: true,
            createdAt: new Date('2025-02-10').toISOString(),
            lastTriggered: new Date('2025-05-20').toISOString(),
            failureCount: 0
          }
        ],
        logs: [
          {
            id: '301',
            timestamp: new Date('2025-05-20T10:15:00Z').toISOString(),
            operation: 'GET /customers',
            status: 'success',
            responseTime: 235,
            responseData: '{"data": [{"id": "cus_xyz", "name": "John Doe"}]}'
          },
          {
            id: '302',
            timestamp: new Date('2025-05-20T11:30:00Z').toISOString(),
            operation: 'POST /payment_intents',
            status: 'success',
            responseTime: 320,
            requestData: '{"amount": 2000, "currency": "usd"}',
            responseData: '{"id": "pi_xyz", "status": "succeeded"}'
          }
        ],
        rateLimit: {
          limit: 100,
          remaining: 95,
          resetAt: new Date(Date.now() + 3600000).toISOString()
        }
      },
      {
        id: '2',
        name: 'Google Analytics',
        type: 'analytics',
        description: 'Web analytics service that tracks and reports website traffic',
        status: 'connected',
        accessToken: 'ya29.**********************',
        refreshToken: '1//**********************',
        tokenExpiry: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date('2025-02-10').toISOString(),
        updatedAt: new Date('2025-05-15').toISOString(),
        createdBy: '1', // Admin user ID
        isEnabled: true,
        lastSynced: new Date('2025-05-18').toISOString(),
        config: {
          propertyId: 'UA-12345678-1',
          viewId: '123456789',
        },
        endpoints: [
          {
            id: '103',
            name: 'Get Report Data',
            path: '/v4/reports:batchGet',
            method: 'POST',
            isActive: true,
            lastUsed: new Date('2025-05-18').toISOString()
          }
        ],
        webhooks: [],
        logs: [
          {
            id: '303',
            timestamp: new Date('2025-05-18T09:00:00Z').toISOString(),
            operation: 'POST /v4/reports:batchGet',
            status: 'success',
            responseTime: 450,
            responseData: '{"reports": [{"data": {"rows": [...]}}]}'
          }
        ]
      },
      {
        id: '3',
        name: 'Mailchimp',
        type: 'marketing',
        description: 'Email marketing platform',
        status: 'disconnected',
        createdAt: new Date('2025-03-15').toISOString(),
        updatedAt: new Date('2025-04-01').toISOString(),
        createdBy: '1', // Admin user ID
        isEnabled: false,
        config: {},
        endpoints: [],
        webhooks: [],
        logs: [
          {
            id: '304',
            timestamp: new Date('2025-04-01T14:20:00Z').toISOString(),
            operation: 'OAuth Connection',
            status: 'error',
            errorMessage: 'OAuth token expired'
          }
        ]
      }
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save integrations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('apiIntegrations', JSON.stringify(integrations));
  }, [integrations]);

  // Check user permissions before modifying API integrations
  const checkPermission = () => {
    if (!currentUser) {
      setError('You must be logged in to manage API integrations');
      return false;
    }

    if (!hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
      setError('You do not have permission to manage API integrations');
      return false;
    }

    return true;
  };

  // Add a new API integration
  const addIntegration = (integrationData: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => {
    if (!checkPermission()) {
      return {} as ApiIntegration;
    }

    const now = new Date().toISOString();
    const newIntegration: ApiIntegration = {
      ...integrationData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      logs: [],
    };

    setIntegrations([...integrations, newIntegration]);
    return newIntegration;
  };

  // Update an existing integration
  const updateIntegration = (id: string, updates: Partial<ApiIntegration>) => {
    if (!checkPermission()) return false;

    const integrationIndex = integrations.findIndex(i => i.id === id);
    if (integrationIndex === -1) {
      setError(`Integration with ID ${id} not found`);
      return false;
    }

    const updatedIntegrations = [...integrations];
    updatedIntegrations[integrationIndex] = {
      ...updatedIntegrations[integrationIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setIntegrations(updatedIntegrations);
    return true;
  };

  // Delete an integration
  const deleteIntegration = (id: string) => {
    if (!checkPermission()) return false;

    setIntegrations(integrations.filter(i => i.id !== id));
    return true;
  };

  // Get integration by ID
  const getIntegrationById = (id: string) => {
    return integrations.find(i => i.id === id);
  };

  // Get integrations by type
  const getIntegrationsByType = (type: ApiIntegration['type']) => {
    return integrations.filter(i => i.type === type);
  };

  // Connect to an API
  const connectApi = async (id: string, config: ApiKeyConfig | OAuthConfig) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(id);
    if (!integration) {
      setError(`Integration with ID ${id} not found`);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For a real implementation, this would be an actual API call
      // For demo purposes, we'll just update the integration status

      const now = new Date().toISOString();
      const updates: Partial<ApiIntegration> = {
        status: 'connected',
        updatedAt: now,
        lastSynced: now,
        isEnabled: true,
      };

      // Add credentials based on config type
      if ('apiKey' in config) {
        updates.apiKey = config.apiKey;
        updates.apiSecret = config.apiSecret;
      } else {
        // OAuth flow would normally exchange code for tokens
        updates.accessToken = 'mock_access_token_' + Math.random().toString(36).substring(2);
        updates.refreshToken = 'mock_refresh_token_' + Math.random().toString(36).substring(2);
        updates.tokenExpiry = new Date(Date.now() + 3600000).toISOString();
      }

      // Add a success log
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: now,
        operation: 'API Connection',
        status: 'success'
      };

      updates.logs = [...(integration.logs || []), newLog];

      updateIntegration(id, updates);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect to API: ${errorMessage}`);

      // Add an error log
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        operation: 'API Connection',
        status: 'error',
        errorMessage
      };

      updateIntegration(id, {
        status: 'error',
        logs: [...(integration.logs || []), newLog],
        lastError: errorMessage
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from an API
  const disconnectApi = (id: string) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(id);
    if (!integration) {
      setError(`Integration with ID ${id} not found`);
      return false;
    }

    const updates: Partial<ApiIntegration> = {
      status: 'disconnected',
      updatedAt: new Date().toISOString(),
      isEnabled: false
    };

    // Add a log entry
    const newLog: ApiLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      operation: 'API Disconnection',
      status: 'success'
    };

    updates.logs = [...(integration.logs || []), newLog];

    return updateIntegration(id, updates);
  };

  // Test an API connection
  const testConnection = async (id: string) => {
    if (!checkPermission()) {
      return { success: false, message: 'Permission denied' };
    }

    const integration = getIntegrationById(id);
    if (!integration) {
      return { success: false, message: `Integration with ID ${id} not found` };
    }

    setIsLoading(true);

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, assume it's successful
      const now = new Date().toISOString();

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: now,
        operation: 'Connection Test',
        status: 'success',
        responseTime: Math.floor(Math.random() * 300) + 100
      };

      updateIntegration(id, {
        logs: [...integration.logs, newLog]
      });

      return { success: true, message: 'Connection successful' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        operation: 'Connection Test',
        status: 'error',
        errorMessage
      };

      updateIntegration(id, {
        logs: [...integration.logs, newLog]
      });

      return { success: false, message: `Connection failed: ${errorMessage}` };
    } finally {
      setIsLoading(false);
    }
  };

  // Add an endpoint to an integration
  const addEndpoint = (integrationId: string, endpoint: Omit<ApiEndpoint, 'id'>) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration) {
      setError(`Integration with ID ${integrationId} not found`);
      return false;
    }

    const newEndpoint: ApiEndpoint = {
      ...endpoint,
      id: generateId()
    };

    const endpoints = [...(integration.endpoints || []), newEndpoint];

    return updateIntegration(integrationId, { endpoints });
  };

  // Update an endpoint
  const updateEndpoint = (integrationId: string, endpointId: string, updates: Partial<ApiEndpoint>) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration || !integration.endpoints) {
      setError(`Integration with ID ${integrationId} not found or has no endpoints`);
      return false;
    }

    const endpointIndex = integration.endpoints.findIndex(e => e.id === endpointId);
    if (endpointIndex === -1) {
      setError(`Endpoint with ID ${endpointId} not found`);
      return false;
    }

    const updatedEndpoints = [...integration.endpoints];
    updatedEndpoints[endpointIndex] = {
      ...updatedEndpoints[endpointIndex],
      ...updates
    };

    return updateIntegration(integrationId, { endpoints: updatedEndpoints });
  };

  // Delete an endpoint
  const deleteEndpoint = (integrationId: string, endpointId: string) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration || !integration.endpoints) {
      setError(`Integration with ID ${integrationId} not found or has no endpoints`);
      return false;
    }

    const updatedEndpoints = integration.endpoints.filter(e => e.id !== endpointId);

    return updateIntegration(integrationId, { endpoints: updatedEndpoints });
  };

  // Add a webhook to an integration
  const addWebhook = (integrationId: string, webhook: Omit<ApiWebhook, 'id' | 'createdAt'>) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration) {
      setError(`Integration with ID ${integrationId} not found`);
      return false;
    }

    const newWebhook: ApiWebhook = {
      ...webhook,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    const webhooks = [...(integration.webhooks || []), newWebhook];

    return updateIntegration(integrationId, { webhooks });
  };

  // Update a webhook
  const updateWebhook = (integrationId: string, webhookId: string, updates: Partial<ApiWebhook>) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration || !integration.webhooks) {
      setError(`Integration with ID ${integrationId} not found or has no webhooks`);
      return false;
    }

    const webhookIndex = integration.webhooks.findIndex(w => w.id === webhookId);
    if (webhookIndex === -1) {
      setError(`Webhook with ID ${webhookId} not found`);
      return false;
    }

    const updatedWebhooks = [...integration.webhooks];
    updatedWebhooks[webhookIndex] = {
      ...updatedWebhooks[webhookIndex],
      ...updates
    };

    return updateIntegration(integrationId, { webhooks: updatedWebhooks });
  };

  // Delete a webhook
  const deleteWebhook = (integrationId: string, webhookId: string) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration || !integration.webhooks) {
      setError(`Integration with ID ${integrationId} not found or has no webhooks`);
      return false;
    }

    const updatedWebhooks = integration.webhooks.filter(w => w.id !== webhookId);

    return updateIntegration(integrationId, { webhooks: updatedWebhooks });
  };

  // Test a webhook
  const testWebhook = async (integrationId: string, webhookId: string) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration || !integration.webhooks) {
      setError(`Integration with ID ${integrationId} not found or has no webhooks`);
      return false;
    }

    const webhook = integration.webhooks.find(w => w.id === webhookId);
    if (!webhook) {
      setError(`Webhook with ID ${webhookId} not found`);
      return false;
    }

    setIsLoading(true);

    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, assume it's successful
      const now = new Date().toISOString();

      // Update the webhook's lastTriggered timestamp
      updateWebhook(integrationId, webhookId, {
        lastTriggered: now
      });

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: now,
        operation: `Test Webhook: ${webhook.name}`,
        status: 'success'
      };

      updateIntegration(integrationId, {
        logs: [...integration.logs, newLog]
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Increment the failure count
      updateWebhook(integrationId, webhookId, {
        failureCount: (webhook.failureCount || 0) + 1
      });

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        operation: `Test Webhook: ${webhook.name}`,
        status: 'error',
        errorMessage
      };

      updateIntegration(integrationId, {
        logs: [...integration.logs, newLog]
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get logs for an integration
  const getLogs = (integrationId: string, limit?: number) => {
    const integration = getIntegrationById(integrationId);
    if (!integration) {
      return [];
    }

    const logs = [...integration.logs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return limit ? logs.slice(0, limit) : logs;
  };

  // Clear logs for an integration
  const clearLogs = (integrationId: string) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration) {
      setError(`Integration with ID ${integrationId} not found`);
      return false;
    }

    return updateIntegration(integrationId, { logs: [] });
  };

  // Execute an API endpoint
  const executeEndpoint = async (integrationId: string, endpointId: string, data?: any) => {
    if (!checkPermission()) {
      return { success: false, error: 'Permission denied' };
    }

    const integration = getIntegrationById(integrationId);
    if (!integration) {
      return { success: false, error: `Integration with ID ${integrationId} not found` };
    }

    const endpoint = integration.endpoints?.find(e => e.id === endpointId);
    if (!endpoint) {
      return { success: false, error: `Endpoint with ID ${endpointId} not found` };
    }

    if (!endpoint.isActive) {
      return { success: false, error: 'Endpoint is not active' };
    }

    if (integration.status !== 'connected') {
      return { success: false, error: 'API is not connected' };
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, create a mock response
      const responseData = {
        success: true,
        data: { message: 'API endpoint executed successfully', timestamp: new Date().toISOString() }
      };

      const now = new Date().toISOString();
      const responseTime = Math.floor(Math.random() * 300) + 100;

      // Update the endpoint's lastUsed timestamp
      updateEndpoint(integrationId, endpointId, {
        lastUsed: now
      });

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: now,
        operation: `${endpoint.method} ${endpoint.path}`,
        endpoint: endpoint.name,
        status: 'success',
        responseTime,
        requestData: data ? JSON.stringify(data) : undefined,
        responseData: JSON.stringify(responseData)
      };

      updateIntegration(integrationId, {
        logs: [...integration.logs, newLog],
        lastSynced: now
      });

      return { success: true, data: responseData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        operation: `${endpoint.method} ${endpoint.path}`,
        endpoint: endpoint.name,
        status: 'error',
        requestData: data ? JSON.stringify(data) : undefined,
        errorMessage
      };

      updateIntegration(integrationId, {
        logs: [...integration.logs, newLog],
        lastError: errorMessage
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data with an API
  const syncData = async (integrationId: string) => {
    if (!checkPermission()) return false;

    const integration = getIntegrationById(integrationId);
    if (!integration) {
      setError(`Integration with ID ${integrationId} not found`);
      return false;
    }

    if (integration.status !== 'connected') {
      setError('API is not connected');
      return false;
    }

    setIsLoading(true);

    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      const now = new Date().toISOString();

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: now,
        operation: 'Data Sync',
        status: 'success',
        responseTime: Math.floor(Math.random() * 1000) + 500
      };

      updateIntegration(integrationId, {
        logs: [...integration.logs, newLog],
        lastSynced: now
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Add a log entry
      const newLog: ApiLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        operation: 'Data Sync',
        status: 'error',
        errorMessage
      };

      updateIntegration(integrationId, {
        logs: [...integration.logs, newLog],
        lastError: errorMessage
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiIntegrationContext.Provider value={{
      integrations,
      isLoading,
      error,

      addIntegration,
      updateIntegration,
      deleteIntegration,
      getIntegrationById,
      getIntegrationsByType,

      connectApi,
      disconnectApi,
      testConnection,

      addEndpoint,
      updateEndpoint,
      deleteEndpoint,

      addWebhook,
      updateWebhook,
      deleteWebhook,
      testWebhook,

      getLogs,
      clearLogs,

      executeEndpoint,
      syncData,
    }}>
      {children}
    </ApiIntegrationContext.Provider>
  );
};

// Custom hook for using the API integration context
export const useApiIntegration = () => useContext(ApiIntegrationContext);
