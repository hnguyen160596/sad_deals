import React, { useState, useEffect } from 'react';
import { useApiIntegration,
  ApiIntegration,
  ApiEndpoint,
  ApiWebhook,
  ApiLog
} from '../context/ApiIntegrationContext';

// Main component
const ApiIntegrationManager: React.FC = () => {
  const {
    integrations,
    isLoading,
    error,
    addIntegration,
    deleteIntegration,
    connectApi,
    disconnectApi,
    testConnection,
    executeEndpoint,
    syncData,
    getLogs
  } = useApiIntegration();

  const [activeTab, setActiveTab] = useState<string>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);
  const [formMode, setFormMode] = useState<'view' | 'add' | 'edit'>('view');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // When an integration is deleted, clear the selected integration
  useEffect(() => {
    if (selectedIntegration && !integrations.find(i => i.id === selectedIntegration.id)) {
      setSelectedIntegration(null);
      setFormMode('view');
    }
  }, [integrations, selectedIntegration]);

  // Filter integrations based on search term and filter type
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || integration.type === filterType;

    return matchesSearch && matchesType;
  });

  // Handle connection testing
  const handleTestConnection = async (id: string) => {
    setLoadingAction(`testing-${id}`);
    try {
      const result = await testConnection(id);
      if (result.success) {
        alert('Connection test successful!');
      } else {
        alert(`Connection test failed: ${result.message}`);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle connection/disconnection
  const handleConnectionToggle = async (integration: ApiIntegration) => {
    if (integration.status === 'connected') {
      if (window.confirm('Are you sure you want to disconnect this integration?')) {
        setLoadingAction(`disconnect-${integration.id}`);
        try {
          const success = disconnectApi(integration.id);
          if (success) {
            if (selectedIntegration?.id === integration.id) {
              // Refresh selected integration data
              const updatedIntegration = integrations.find(i => i.id === integration.id);
              if (updatedIntegration) {
                setSelectedIntegration(updatedIntegration);
              }
            }
          }
        } finally {
          setLoadingAction(null);
        }
      }
    } else {
      // For demo purposes we'll just simulate successful connection
      // In a real app, this would open a connection modal with form fields
      setLoadingAction(`connect-${integration.id}`);
      try {
        const success = await connectApi(integration.id, {
          apiKey: 'demo_api_key_' + Math.random().toString(36).substring(2)
        });

        if (success) {
          if (selectedIntegration?.id === integration.id) {
            // Refresh selected integration data
            const updatedIntegration = integrations.find(i => i.id === integration.id);
            if (updatedIntegration) {
              setSelectedIntegration(updatedIntegration);
            }
          }
        }
      } finally {
        setLoadingAction(null);
      }
    }
  };

  // Handle sync
  const handleSync = async (id: string) => {
    setLoadingAction(`sync-${id}`);
    try {
      const success = await syncData(id);
      if (success) {
        alert('Data synced successfully!');

        if (selectedIntegration?.id === id) {
          // Refresh selected integration data
          const updatedIntegration = integrations.find(i => i.id === id);
          if (updatedIntegration) {
            setSelectedIntegration(updatedIntegration);
          }
        }
      } else {
        alert('Failed to sync data.');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      deleteIntegration(id);
    }
  };

  // Handle add new integration (simplified for demo)
  const handleAddIntegration = () => {
    const name = prompt('Enter integration name:');
    if (!name) return;

    const description = prompt('Enter integration description:');
    if (!description) return;

    const type = prompt('Enter integration type (payment, analytics, marketing, social, crm, other):');
    if (!type) return;

    const newIntegration = addIntegration({
      name,
      description,
      type: type as ApiIntegration['type'],
      status: 'disconnected',
      createdBy: '1', // Current user ID would be used in a real app
      isEnabled: false,
      config: {},
      endpoints: [],
      webhooks: []
    });

    setSelectedIntegration(newIntegration);
  };

  // Handle endpoint execution
  const handleExecuteEndpoint = async (integrationId: string, endpointId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to execute the "${name}" endpoint?`)) {
      return;
    }

    setLoadingAction(`execute-${endpointId}`);
    try {
      // For demo purposes, we're not providing real data
      const result = await executeEndpoint(integrationId, endpointId);

      if (result.success) {
        alert('Endpoint executed successfully!');

        if (selectedIntegration?.id === integrationId) {
          // Refresh selected integration data
          const updatedIntegration = integrations.find(i => i.id === integrationId);
          if (updatedIntegration) {
            setSelectedIntegration(updatedIntegration);
          }
        }
      } else {
        alert(`Failed to execute endpoint: ${result.error}`);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // Render logs
  const renderLogs = (integrationId: string) => {
    const logs = getLogs(integrationId, 5); // Get 5 most recent logs

    if (logs.length === 0) {
      return <p className="text-gray-500 text-sm italic">No logs available</p>;
    }

    return (
      <div className="space-y-3 max-h-80 overflow-auto">
        {logs.map(log => (
          <div
            key={log.id}
            className={`border-l-4 pl-3 py-2 ${
              log.status === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}
          >
            <div className="flex justify-between">
              <span className="font-medium text-sm">{log.operation}</span>
              <span className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>

            {log.responseTime && (
              <div className="text-xs text-gray-600">
                Response time: {log.responseTime}ms
              </div>
            )}

            {log.errorMessage && (
              <div className="text-xs text-red-600 mt-1">
                Error: {log.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Integration type badge
  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, { bg: string; text: string }> = {
      payment: { bg: 'bg-blue-100', text: 'text-blue-800' },
      analytics: { bg: 'bg-purple-100', text: 'text-purple-800' },
      marketing: { bg: 'bg-pink-100', text: 'text-pink-800' },
      social: { bg: 'bg-green-100', text: 'text-green-800' },
      crm: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      other: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const { bg, text } = typeColors[type] || typeColors.other;

    return (
      <span className={`${bg} ${text} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {type}
      </span>
    );
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string; text: string }> = {
      connected: { bg: 'bg-green-100', text: 'text-green-800' },
      disconnected: { bg: 'bg-gray-100', text: 'text-gray-800' },
      error: { bg: 'bg-red-100', text: 'text-red-800' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' }
    };

    const { bg, text } = statusColors[status] || statusColors.disconnected;

    return (
      <span className={`${bg} ${text} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Integration Manager</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - List of integrations */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Integrations</h2>
          </div>

          <div className="p-4 border-b space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search integrations..."
                className="flex-1 border rounded px-3 py-2 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="border rounded px-3 py-2 text-sm"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="payment">Payment</option>
                <option value="analytics">Analytics</option>
                <option value="marketing">Marketing</option>
                <option value="social">Social</option>
                <option value="crm">CRM</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              className="w-full bg-[#982a4a] hover:bg-[#982a4a]/90 text-white py-2 rounded-md text-sm"
              onClick={handleAddIntegration}
            >
              + Add Integration
            </button>
          </div>

          <div className="divide-y max-h-[600px] overflow-auto">
            {isLoading && !loadingAction ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredIntegrations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No integrations found</div>
            ) : (
              filteredIntegrations.map(integration => (
                <div
                  key={integration.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedIntegration?.id === integration.id ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{integration.description}</p>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    {getTypeBadge(integration.type)}
                    <div className="text-xs text-gray-500">
                      {integration.lastSynced ? (
                        <>Last synced: {new Date(integration.lastSynced).toLocaleDateString()}</>
                      ) : (
                        <>Never synced</>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main content - Integration details */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow">
          {!selectedIntegration ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No Integration Selected</h3>
              <p>Select an integration from the list or add a new one to get started.</p>
            </div>
          ) : (
            <>
              {/* Integration header */}
              <div className="border-b p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedIntegration.name}</h2>
                    <p className="text-gray-600">{selectedIntegration.description}</p>

                    <div className="flex items-center mt-2 space-x-2">
                      {getTypeBadge(selectedIntegration.type)}
                      {getStatusBadge(selectedIntegration.status)}
                      {selectedIntegration.isEnabled ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Enabled
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                        selectedIntegration.status === 'connected'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      onClick={() => handleConnectionToggle(selectedIntegration)}
                      disabled={!!loadingAction}
                    >
                      {loadingAction === `connect-${selectedIntegration.id}` || loadingAction === `disconnect-${selectedIntegration.id}` ? (
                        'Processing...'
                      ) : selectedIntegration.status === 'connected' ? (
                        'Disconnect'
                      ) : (
                        'Connect'
                      )}
                    </button>

                    <button
                      className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md"
                      onClick={() => handleTestConnection(selectedIntegration.id)}
                      disabled={!!loadingAction}
                    >
                      {loadingAction === `testing-${selectedIntegration.id}` ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md"
                      onClick={() => handleDelete(selectedIntegration.id)}
                      disabled={!!loadingAction}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium">{selectedIntegration.status}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Last Synced</p>
                    <p className="font-medium">
                      {selectedIntegration.lastSynced ? (
                        new Date(selectedIntegration.lastSynced).toLocaleString()
                      ) : (
                        'Never'
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{new Date(selectedIntegration.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Endpoints</p>
                    <p className="font-medium">{selectedIntegration.endpoints?.length || 0}</p>
                  </div>
                </div>

                {selectedIntegration.lastError && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p className="text-sm font-medium">Last Error:</p>
                    <p className="text-sm">{selectedIntegration.lastError}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b px-6">
                <ul className="flex overflow-x-auto">
                  <li className="mr-1">
                    <button
                      className={`inline-block py-3 px-4 text-sm font-medium ${
                        activeTab === 'integrations' ? 'border-b-2 border-[#982a4a] text-[#982a4a]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('integrations')}
                    >
                      Details
                    </button>
                  </li>
                  <li className="mr-1">
                    <button
                      className={`inline-block py-3 px-4 text-sm font-medium ${
                        activeTab === 'endpoints' ? 'border-b-2 border-[#982a4a] text-[#982a4a]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('endpoints')}
                    >
                      Endpoints ({selectedIntegration.endpoints?.length || 0})
                    </button>
                  </li>
                  <li className="mr-1">
                    <button
                      className={`inline-block py-3 px-4 text-sm font-medium ${
                        activeTab === 'webhooks' ? 'border-b-2 border-[#982a4a] text-[#982a4a]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('webhooks')}
                    >
                      Webhooks ({selectedIntegration.webhooks?.length || 0})
                    </button>
                  </li>
                  <li className="mr-1">
                    <button
                      className={`inline-block py-3 px-4 text-sm font-medium ${
                        activeTab === 'logs' ? 'border-b-2 border-[#982a4a] text-[#982a4a]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('logs')}
                    >
                      Logs ({selectedIntegration.logs?.length || 0})
                    </button>
                  </li>
                  <li className="mr-1">
                    <button
                      className={`inline-block py-3 px-4 text-sm font-medium ${
                        activeTab === 'settings' ? 'border-b-2 border-[#982a4a] text-[#982a4a]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('settings')}
                    >
                      Settings
                    </button>
                  </li>
                </ul>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'integrations' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">Integration Details</h3>
                      <button
                        className="bg-[#982a4a] hover:bg-[#982a4a]/90 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => handleSync(selectedIntegration.id)}
                        disabled={selectedIntegration.status !== 'connected' || !!loadingAction}
                      >
                        {loadingAction === `sync-${selectedIntegration.id}` ? 'Syncing...' : 'Sync Data'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Configuration */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="font-medium">Configuration</h4>
                        </div>
                        <div className="p-4">
                          {Object.keys(selectedIntegration.config).length > 0 ? (
                            <div className="bg-gray-50 rounded p-3">
                              <pre className="whitespace-pre-wrap text-sm">
                                {JSON.stringify(selectedIntegration.config, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">No configuration available</p>
                          )}
                        </div>
                      </div>

                      {/* Authentication */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="font-medium">Authentication</h4>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            {selectedIntegration.apiKey && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                <div className="flex">
                                  <input
                                    type="password"
                                    value="••••••••••••••••••••••••••"
                                    readOnly
                                    className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                  />
                                  <button className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm">
                                    View
                                  </button>
                                </div>
                              </div>
                            )}

                            {selectedIntegration.apiSecret && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                                <div className="flex">
                                  <input
                                    type="password"
                                    value="••••••••••••••••••••••••••"
                                    readOnly
                                    className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                  />
                                  <button className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm">
                                    View
                                  </button>
                                </div>
                              </div>
                            )}

                            {selectedIntegration.accessToken && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                                <div className="flex">
                                  <input
                                    type="password"
                                    value="••••••••••••••••••••••••••"
                                    readOnly
                                    className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                  />
                                  <button className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm">
                                    View
                                  </button>
                                </div>
                              </div>
                            )}

                            {selectedIntegration.tokenExpiry && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Token Expiry</label>
                                <input
                                  type="text"
                                  value={new Date(selectedIntegration.tokenExpiry).toLocaleString()}
                                  readOnly
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                              </div>
                            )}

                            {!selectedIntegration.apiKey && !selectedIntegration.accessToken && (
                              <p className="text-gray-500 text-sm italic">No authentication credentials available</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recent Logs */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                          <h4 className="font-medium">Recent Activity</h4>
                          <button
                            className="text-[#982a4a] hover:text-[#982a4a]/80 text-sm"
                            onClick={() => setActiveTab('logs')}
                          >
                            View All Logs
                          </button>
                        </div>
                        <div className="p-4">
                          {renderLogs(selectedIntegration.id)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'endpoints' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">API Endpoints</h3>
                      <button
                        className="bg-[#982a4a] hover:bg-[#982a4a]/90 text-white px-4 py-2 rounded-md text-sm"
                      >
                        + Add Endpoint
                      </button>
                    </div>

                    {!selectedIntegration.endpoints || selectedIntegration.endpoints.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg">
                        <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No endpoints configured</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by adding your first API endpoint.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Path
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Used
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedIntegration.endpoints.map(endpoint => (
                              <tr key={endpoint.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                                  {endpoint.description && (
                                    <div className="text-xs text-gray-500">{endpoint.description}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 font-mono">{endpoint.path}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                    endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {endpoint.method}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    endpoint.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {endpoint.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {endpoint.lastUsed ? new Date(endpoint.lastUsed).toLocaleString() : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    className="text-[#982a4a] hover:text-[#982a4a]/80 mr-3"
                                    onClick={() => handleExecuteEndpoint(selectedIntegration.id, endpoint.id, endpoint.name)}
                                    disabled={!endpoint.isActive || selectedIntegration.status !== 'connected' || !!loadingAction}
                                  >
                                    {loadingAction === `execute-${endpoint.id}` ? 'Executing...' : 'Execute'}
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-900 mr-3">
                                    Edit
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'webhooks' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">Webhooks</h3>
                      <button
                        className="bg-[#982a4a] hover:bg-[#982a4a]/90 text-white px-4 py-2 rounded-md text-sm"
                      >
                        + Add Webhook
                      </button>
                    </div>

                    {!selectedIntegration.webhooks || selectedIntegration.webhooks.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg">
                        <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16.5v-9l9 4.5-9 4.5z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No webhooks configured</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Configure webhooks to receive real-time updates from this integration.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Event
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                URL
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Triggered
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedIntegration.webhooks.map(webhook => (
                              <tr key={webhook.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{webhook.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{webhook.event}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 truncate max-w-xs">{webhook.url}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {webhook.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  {webhook.failureCount > 0 && (
                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      {webhook.failureCount} failures
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-[#982a4a] hover:text-[#982a4a]/80 mr-3">
                                    Test
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-900 mr-3">
                                    Edit
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">Activity Logs</h3>
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-gray-900 px-3 py-1 border rounded-md text-sm">
                          Export Logs
                        </button>
                        <button className="text-red-600 hover:text-red-900 px-3 py-1 border rounded-md text-sm">
                          Clear Logs
                        </button>
                      </div>
                    </div>

                    {!selectedIntegration.logs || selectedIntegration.logs.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg">
                        <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2.5 2.5 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity logs</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Activity logs will appear here once you start using this integration.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timestamp
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Operation
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Response Time
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedIntegration.logs.map(log => (
                              <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{log.operation}</div>
                                  {log.endpoint && (
                                    <div className="text-xs text-gray-500">{log.endpoint}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.responseTime ? `${log.responseTime}ms` : '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                  <button className="hover:text-blue-800">
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Integration Settings</h3>

                    <div className="space-y-6">
                      {/* General Settings */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="font-medium">General Settings</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Integration Name</label>
                            <input
                              type="text"
                              defaultValue={selectedIntegration.name}
                              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              defaultValue={selectedIntegration.description}
                              rows={3}
                              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                              defaultValue={selectedIntegration.type}
                              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                              <option value="payment">Payment</option>
                              <option value="analytics">Analytics</option>
                              <option value="marketing">Marketing</option>
                              <option value="social">Social</option>
                              <option value="crm">CRM</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="enabled"
                              type="checkbox"
                              defaultChecked={selectedIntegration.isEnabled}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
                              Enable Integration
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* API Configuration */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="font-medium">API Configuration</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                            <input
                              type="text"
                              defaultValue={selectedIntegration.baseUrl || ''}
                              placeholder="https://api.example.com"
                              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                            <div className="flex">
                              <input
                                type="password"
                                defaultValue={selectedIntegration.apiKey || ''}
                                placeholder="Enter API Key"
                                className="flex-1 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                              />
                              <button className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm">
                                View
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                            <div className="flex">
                              <input
                                type="password"
                                defaultValue={selectedIntegration.apiSecret || ''}
                                placeholder="Enter API Secret"
                                className="flex-1 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                              />
                              <button className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm">
                                View
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <button className="bg-[#982a4a] hover:bg-[#982a4a]/90 text-white px-4 py-2 rounded-md text-sm">
                              Save Settings
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="border border-red-200 rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                          <h4 className="font-medium text-red-700">Danger Zone</h4>
                        </div>
                        <div className="p-4">
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                            onClick={() => handleDelete(selectedIntegration.id)}
                          >
                            Delete Integration
                          </button>
                          <p className="mt-2 text-sm text-gray-500">
                            This action cannot be undone. This will permanently delete this integration and all associated data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiIntegrationManager;
