import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { useToast } from '../context/ToastContext';
import { useActivityLog } from '../context/ActivityLogContext';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  type: 'notification' | 'marketing' | 'transactional' | 'system';
  variables: string[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  previewImage?: string;
}

// Sample email template data
const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    subject: 'Welcome to Sales Aholics Deals!',
    content: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { background-color: #982a4a; padding: 20px; color: white; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #982a4a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Sales Aholics Deals</h1>
        </div>
        <div class="content">
          <p>Hello {{name}},</p>
          <p>Thank you for joining Sales Aholics Deals! We're excited to have you as part of our community.</p>
          <p>With your new account, you can:</p>
          <ul>
            <li>Save your favorite deals for later</li>
            <li>Get personalized deal recommendations</li>
            <li>Set up alerts for products you're interested in</li>
            <li>And much more!</li>
          </ul>
          <p>To get started, visit your dashboard and complete your profile:</p>
          <p style="text-align: center;">
            <a href="{{dashboardUrl}}" class="button">Go to My Dashboard</a>
          </p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Happy deal hunting!</p>
          <p>The Sales Aholics Deals Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Sales Aholics Deals. All rights reserved.</p>
          <p>You're receiving this email because you signed up for an account on our website.</p>
          <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Email Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
    `,
    description: 'Sent to new users after they register an account',
    type: 'transactional',
    variables: ['{{name}}', '{{dashboardUrl}}', '{{unsubscribeUrl}}', '{{preferencesUrl}}'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isDefault: true,
    previewImage: '/images/templates/welcome-email.jpg',
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Reset Your Password - Sales Aholics Deals',
    content: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { background-color: #982a4a; padding: 20px; color: white; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #982a4a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .code { font-family: monospace; font-size: 24px; padding: 10px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px; letter-spacing: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello {{name}},</p>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <p style="text-align: center;">
            <a href="{{resetUrl}}" class="button">Reset My Password</a>
          </p>
          <p>Or use this reset code:</p>
          <p style="text-align: center;" class="code">{{resetCode}}</p>
          <p>This link and code will expire in 24 hours.</p>
          <p>If you have any issues, please contact our support team.</p>
          <p>Thanks,</p>
          <p>The Sales Aholics Deals Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Sales Aholics Deals. All rights reserved.</p>
          <p>You're receiving this email because a password reset was requested for your account.</p>
        </div>
      </div>
    </body>
    </html>
    `,
    description: 'Sent when a user requests a password reset',
    type: 'transactional',
    variables: ['{{name}}', '{{resetUrl}}', '{{resetCode}}'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isDefault: true,
    previewImage: '/images/templates/password-reset.jpg',
  },
  {
    id: 'daily-deals',
    name: 'Daily Deals Newsletter',
    subject: 'Today\'s Top Deals Just For You!',
    content: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { background-color: #982a4a; padding: 20px; color: white; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #982a4a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .deal { margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
        .deal-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
        .deal-title { font-weight: bold; font-size: 18px; margin: 0; }
        .deal-price { color: #982a4a; font-weight: bold; font-size: 18px; }
        .deal-image { width: 100%; height: auto; margin-bottom: 10px; }
        .deal-cta { text-align: center; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Today's Top Deals</h1>
          <p>Handpicked just for you, {{name}}!</p>
        </div>
        <div class="content">
          <p>Here are today's best deals that we think you'll love based on your preferences:</p>

          {{#each deals}}
          <div class="deal">
            <div class="deal-header">
              <h2 class="deal-title">{{this.title}}</h2>
              <span class="deal-price">{{this.price}}</span>
            </div>
            <img src="{{this.imageUrl}}" alt="{{this.title}}" class="deal-image" />
            <p>{{this.description}}</p>
            <div class="deal-cta">
              <a href="{{this.url}}" class="button">View Deal</a>
            </div>
          </div>
          {{/each}}

          <p style="text-align: center; margin-top: 30px;">
            <a href="{{allDealsUrl}}" class="button">See All Today's Deals</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Sales Aholics Deals. All rights reserved.</p>
          <p>You're receiving this email because you subscribed to our daily deals newsletter.</p>
          <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Email Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
    `,
    description: 'Daily email newsletter featuring the top deals',
    type: 'marketing',
    variables: ['{{name}}', '{{deals}}', '{{allDealsUrl}}', '{{unsubscribeUrl}}', '{{preferencesUrl}}'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isDefault: true,
    previewImage: '/images/templates/daily-deals.jpg',
  },
];

const EmailTemplateEditor: React.FC = () => {
  const { showToast } = useToast();
  const { addLogEntry } = useActivityLog();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState('design');

  // Initialize templates from localStorage or use defaults
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem('email_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      } else {
        setTemplates(defaultTemplates);
      }
    } catch (error) {
      console.error('Failed to load email templates:', error);
      setTemplates(defaultTemplates);
    }
  }, []);

  // Save templates to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('email_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save email templates:', error);
    }
  }, [templates]);

  // Set the editing template when selection changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setEditingTemplate({ ...template });

        // Initialize test variables
        const variableObj: Record<string, string> = {};
        template.variables.forEach(v => {
          const varName = v.replace('{{', '').replace('}}', '');
          variableObj[varName] = `[${varName} value]`;
        });
        setTestVariables(variableObj);
      }
    } else if (isCreatingTemplate) {
      // Create a new template
      const newId = `template-${Date.now()}`;
      const newTemplate: EmailTemplate = {
        id: newId,
        name: 'New Template',
        subject: 'New Email Template',
        content: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
            .header { background-color: #982a4a; padding: 20px; color: white; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Email Title</h1>
            </div>
            <div class="content">
              <p>Hello {{name}},</p>
              <p>Your email content goes here.</p>
            </div>
            <div class="footer">
              <p>© 2025 Sales Aholics Deals. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        `,
        description: 'New custom email template',
        type: 'notification',
        variables: ['{{name}}'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: false,
      };
      setEditingTemplate(newTemplate);
      setTestVariables({ name: '[name value]' });
    } else {
      setEditingTemplate(null);
    }
  }, [selectedTemplateId, isCreatingTemplate, templates]);

  // Filter templates based on search and type filter
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    const now = new Date().toISOString();
    const updatedTemplate = {
      ...editingTemplate,
      updatedAt: now,
    };

    if (isCreatingTemplate) {
      // Add new template
      setTemplates([...templates, updatedTemplate]);
      setIsCreatingTemplate(false);
      showToast(`Template "${updatedTemplate.name}" created successfully`, 'success');
      addLogEntry({
        action: 'Create',
        targetType: 'Email Template',
        targetName: updatedTemplate.name,
        details: `Created new email template`,
      });
    } else {
      // Update existing template
      setTemplates(templates.map(t =>
        t.id === updatedTemplate.id ? updatedTemplate : t
      ));
      showToast(`Template "${updatedTemplate.name}" updated successfully`, 'success');
      addLogEntry({
        action: 'Update',
        targetType: 'Email Template',
        targetId: updatedTemplate.id,
        targetName: updatedTemplate.name,
        details: `Updated email template`,
      });
    }

    setSelectedTemplateId(updatedTemplate.id);
  };

  const handleDeleteTemplate = () => {
    if (!editingTemplate) return;

    if (editingTemplate.isDefault) {
      showToast('Cannot delete default templates', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the template "${editingTemplate.name}"?`)) {
      setTemplates(templates.filter(t => t.id !== editingTemplate.id));
      setSelectedTemplateId(null);
      setEditingTemplate(null);

      showToast(`Template "${editingTemplate.name}" deleted`, 'info');
      addLogEntry({
        action: 'Delete',
        targetType: 'Email Template',
        targetId: editingTemplate.id,
        targetName: editingTemplate.name,
        details: `Deleted email template`,
      });
    }
  };

  const handleDuplicateTemplate = () => {
    if (!editingTemplate) return;

    const newId = `${editingTemplate.id}-copy-${Date.now()}`;
    const newTemplate: EmailTemplate = {
      ...editingTemplate,
      id: newId,
      name: `${editingTemplate.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates([...templates, newTemplate]);
    setSelectedTemplateId(newId);

    showToast(`Template "${editingTemplate.name}" duplicated`, 'success');
    addLogEntry({
      action: 'Create',
      targetType: 'Email Template',
      targetName: newTemplate.name,
      details: `Duplicated email template`,
    });
  };

  const handleSendTestEmail = () => {
    if (!editingTemplate) return;

    const email = window.prompt('Enter email address to send test to:');
    if (!email) return;

    // In a real app, this would call an API endpoint to send the test email
    // Here we just simulate it
    setTimeout(() => {
      showToast(`Test email sent to ${email}`, 'success');
      addLogEntry({
        action: 'Test',
        targetType: 'Email Template',
        targetName: editingTemplate.name,
        details: `Sent test email to ${email}`,
      });
    }, 1000);
  };

  const handleExportTemplate = () => {
    if (!editingTemplate) return;

    const templateData = JSON.stringify(editingTemplate, null, 2);
    const blob = new Blob([templateData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingTemplate.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Template exported successfully', 'success');
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTemplate = JSON.parse(e.target?.result as string) as EmailTemplate;

        // Generate a new ID to avoid conflicts
        importedTemplate.id = `imported-${Date.now()}`;
        importedTemplate.name = `${importedTemplate.name} (Imported)`;
        importedTemplate.isDefault = false;
        importedTemplate.createdAt = new Date().toISOString();
        importedTemplate.updatedAt = new Date().toISOString();

        setTemplates([...templates, importedTemplate]);
        setSelectedTemplateId(importedTemplate.id);

        showToast(`Template "${importedTemplate.name}" imported successfully`, 'success');
        addLogEntry({
          action: 'Import',
          targetType: 'Email Template',
          targetName: importedTemplate.name,
          details: `Imported email template`,
        });
      } catch (error) {
        showToast('Failed to import template. Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = '';
  };

  const handleTemplateTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      type: e.target.value as any,
    });
  };

  const handleAddVariable = () => {
    if (!editingTemplate) return;

    const variableName = window.prompt('Enter variable name (without {{ }}):');
    if (!variableName) return;

    const formattedVariable = `{{${variableName}}}`;

    // Check if variable already exists
    if (editingTemplate.variables.includes(formattedVariable)) {
      showToast(`Variable ${formattedVariable} already exists`, 'error');
      return;
    }

    setEditingTemplate({
      ...editingTemplate,
      variables: [...editingTemplate.variables, formattedVariable],
    });

    // Add to test variables
    setTestVariables({
      ...testVariables,
      [variableName]: `[${variableName} value]`,
    });
  };

  const handleRemoveVariable = (variable: string) => {
    if (!editingTemplate) return;

    setEditingTemplate({
      ...editingTemplate,
      variables: editingTemplate.variables.filter(v => v !== variable),
    });

    // Remove from test variables
    const varName = variable.replace('{{', '').replace('}}', '');
    const newTestVars = { ...testVariables };
    delete newTestVars[varName];
    setTestVariables(newTestVars);
  };

  const handleTestVariableChange = (variable: string, value: string) => {
    setTestVariables({
      ...testVariables,
      [variable]: value,
    });
  };

  // Replace variables in content with test values
  const getPreviewContent = () => {
    if (!editingTemplate) return '';

    let content = editingTemplate.content;

    // Simple variable replacement
    Object.entries(testVariables).forEach(([variable, value]) => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  };

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'transactional': return 'Transactional';
      case 'marketing': return 'Marketing';
      case 'notification': return 'Notification';
      case 'system': return 'System';
      default: return type;
    }
  };

  // Render different badges based on template type
  const getTemplateTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'transactional': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-green-100 text-green-800';
      case 'notification': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Template Manager</h1>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={() => {
              setSelectedTemplateId(null);
              setIsCreatingTemplate(true);
            }}
          >
            Create New Template
          </Button>

          <label className="relative">
            <Button variant="outline">Import Template</Button>
            <input
              type="file"
              accept=".json"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImportTemplate}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>

              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="transactional">Transactional</option>
                  <option value="marketing">Marketing</option>
                  <option value="notification">Notification</option>
                  <option value="system">System</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 max-h-[600px] overflow-y-auto">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map(template => (
                    <li key={template.id}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          selectedTemplateId === template.id
                            ? 'bg-[#982a4a]/10 text-[#982a4a] font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setIsCreatingTemplate(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="truncate">{template.name}</span>
                          <div className="flex items-center mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTemplateTypeBadgeClass(template.type)}`}>
                              {getTemplateTypeLabel(template.type)}
                            </span>
                            {template.isDefault && (
                              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-4 text-gray-500">
                    No templates found
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="md:col-span-3">
          {editingTemplate ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>
                    {isCreatingTemplate ? 'Create New Template' : 'Edit Template'}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? 'Edit Mode' : 'Preview Mode'}
                    </Button>
                    {!isCreatingTemplate && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDuplicateTemplate}
                        >
                          Duplicate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportTemplate}
                        >
                          Export
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {previewMode ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h3 className="font-medium text-gray-700 mb-2">Preview Subject</h3>
                      <div className="bg-white p-3 border rounded-md">
                        {editingTemplate.subject}
                      </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-md">
                      <h3 className="font-medium text-gray-700 mb-2">Test Variables</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {editingTemplate.variables.map(variable => {
                          const varName = variable.replace('{{', '').replace('}}', '');
                          return (
                            <div key={variable} className="flex items-center">
                              <label className="block text-sm font-medium text-gray-700 mr-2">
                                {variable}:
                              </label>
                              <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                                value={testVariables[varName] || ''}
                                onChange={(e) => handleTestVariableChange(varName, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-700">Email Preview</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendTestEmail}
                        >
                          Send Test Email
                        </Button>
                      </div>

                      <div className="bg-white border rounded-md overflow-hidden">
                        <div className="border-b px-4 py-2 bg-gray-50 flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mx-1"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mx-1"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 mx-1"></div>
                          <div className="mx-auto text-sm text-gray-500">Email Preview</div>
                        </div>
                        <iframe
                          srcDoc={getPreviewContent()}
                          title="Email Preview"
                          className="w-full h-[600px] border-0"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="design">Design</TabsTrigger>
                      <TabsTrigger value="content">HTML Content</TabsTrigger>
                      <TabsTrigger value="variables">Variables</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* Design Tab */}
                    <TabsContent value="design">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Template Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              name: e.target.value
                            })}
                            disabled={editingTemplate.isDefault}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Subject
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                            value={editingTemplate.subject}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              subject: e.target.value
                            })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                            value={editingTemplate.description}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              description: e.target.value
                            })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Template Type
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                              value={editingTemplate.type}
                              onChange={handleTemplateTypeChange}
                              disabled={editingTemplate.isDefault}
                            >
                              <option value="transactional">Transactional</option>
                              <option value="marketing">Marketing</option>
                              <option value="notification">Notification</option>
                              <option value="system">System</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* HTML Content Tab */}
                    <TabsContent value="content">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            HTML Content
                          </label>
                          <div className="relative">
                            <textarea
                              rows={20}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] font-mono text-sm"
                              value={editingTemplate.content}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                content: e.target.value
                              })}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Use HTML to design your email template. You can use variables in double curly braces like: {'{{variable}}'}.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Variables Tab */}
                    <TabsContent value="variables">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-700">Template Variables</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddVariable}
                          >
                            Add Variable
                          </Button>
                        </div>

                        {editingTemplate.variables.length > 0 ? (
                          <ul className="space-y-2">
                            {editingTemplate.variables.map(variable => (
                              <li
                                key={variable}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                              >
                                <span className="font-mono text-sm">{variable}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveVariable(variable)}
                                >
                                  Remove
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-center py-4 text-gray-500">
                            No variables defined
                          </p>
                        )}

                        <div className="p-4 bg-blue-50 rounded-md">
                          <h4 className="font-medium text-blue-700 mb-2">Using Variables</h4>
                          <p className="text-sm text-blue-600">
                            Variables allow you to personalize emails for each recipient. Use them in double curly braces like {'{{variable}}'} in your HTML content. When sending emails, these will be replaced with actual values.
                          </p>
                          <div className="mt-2 text-sm text-blue-600">
                            <p className="font-medium">Common variables:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>{'{{name}}'}: Recipient's name</li>
                              <li>{'{{email}}'}: Recipient's email</li>
                              <li>{'{{unsubscribeUrl}}'}: Link to unsubscribe</li>
                              <li>{'{{dashboardUrl}}'}: Link to user dashboard</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">Template Information</h3>
                          <ul className="space-y-2">
                            <li className="grid grid-cols-3 gap-4 py-2 border-b">
                              <span className="text-gray-500">Template ID:</span>
                              <span className="col-span-2 font-mono text-sm">{editingTemplate.id}</span>
                            </li>
                            <li className="grid grid-cols-3 gap-4 py-2 border-b">
                              <span className="text-gray-500">Created:</span>
                              <span className="col-span-2">{new Date(editingTemplate.createdAt).toLocaleString()}</span>
                            </li>
                            <li className="grid grid-cols-3 gap-4 py-2 border-b">
                              <span className="text-gray-500">Last Updated:</span>
                              <span className="col-span-2">{new Date(editingTemplate.updatedAt).toLocaleString()}</span>
                            </li>
                            <li className="grid grid-cols-3 gap-4 py-2 border-b">
                              <span className="text-gray-500">Type:</span>
                              <span className="col-span-2">{getTemplateTypeLabel(editingTemplate.type)}</span>
                            </li>
                            <li className="grid grid-cols-3 gap-4 py-2 border-b">
                              <span className="text-gray-500">Default Template:</span>
                              <span className="col-span-2">{editingTemplate.isDefault ? 'Yes' : 'No'}</span>
                            </li>
                            <li className="grid grid-cols-3 gap-4 py-2 border-b">
                              <span className="text-gray-500">Variable Count:</span>
                              <span className="col-span-2">{editingTemplate.variables.length}</span>
                            </li>
                          </ul>
                        </div>

                        {!editingTemplate.isDefault && (
                          <div className="pt-4 border-t mt-6">
                            <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Deleting a template cannot be undone. This will permanently remove the template from your account.
                            </p>
                            <Button
                              variant="danger"
                              onClick={handleDeleteTemplate}
                            >
                              Delete Template
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>

              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplateId(null);
                    setEditingTemplate(null);
                    setIsCreatingTemplate(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveTemplate}
                >
                  {isCreatingTemplate ? 'Create Template' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Template Editor</h3>
                <p className="text-gray-500">Select a template to edit or create a new one</p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => {
                    setSelectedTemplateId(null);
                    setIsCreatingTemplate(true);
                  }}
                >
                  Create New Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
