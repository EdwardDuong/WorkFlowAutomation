import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { WorkflowNode } from '../../types/workflow';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, config: Record<string, any>) => void;
}

export default function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setConfig(node.data.config || {});
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onUpdate(node.id, config);
    onClose();
  };

  const renderHttpRequestConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Method
        </label>
        <select
          value={config.method || 'GET'}
          onChange={(e) => setConfig({ ...config, method: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL *
        </label>
        <input
          type="text"
          value={config.url || ''}
          onChange={(e) => setConfig({ ...config, url: e.target.value })}
          placeholder="https://api.example.com/endpoint"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Headers (JSON)
        </label>
        <textarea
          value={config.headers ? JSON.stringify(config.headers, null, 2) : '{}'}
          onChange={(e) => {
            try {
              const headers = JSON.parse(e.target.value);
              setConfig({ ...config, headers });
            } catch {
              // Invalid JSON, don't update
            }
          }}
          rows={4}
          placeholder='{"Content-Type": "application/json"}'
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body
        </label>
        <textarea
          value={config.body || ''}
          onChange={(e) => setConfig({ ...config, body: e.target.value })}
          rows={6}
          placeholder='{"key": "value"}'
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition Expression *
        </label>
        <textarea
          value={config.condition || ''}
          onChange={(e) => setConfig({ ...config, condition: e.target.value })}
          rows={6}
          placeholder="response.status === 200"
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          JavaScript expression that returns true or false
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800 font-medium mb-2">Available Variables:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><code className="bg-blue-100 px-1 rounded">context</code> - Workflow execution context</li>
          <li><code className="bg-blue-100 px-1 rounded">previousOutput</code> - Output from previous node</li>
        </ul>
      </div>
    </div>
  );

  const renderTransformConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transform Script *
        </label>
        <textarea
          value={config.script || ''}
          onChange={(e) => setConfig({ ...config, script: e.target.value })}
          rows={10}
          placeholder="return { transformed: previousOutput.data };"
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          JavaScript code to transform data. Must return a value.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800 font-medium mb-2">Available Variables:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><code className="bg-blue-100 px-1 rounded">context</code> - Workflow execution context</li>
          <li><code className="bg-blue-100 px-1 rounded">previousOutput</code> - Output from previous node</li>
        </ul>
      </div>
    </div>
  );

  const renderDelayConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duration (milliseconds) *
        </label>
        <input
          type="number"
          value={config.duration || 1000}
          onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 0 })}
          min="0"
          step="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          {config.duration ? `${(config.duration / 1000).toFixed(2)} seconds` : '0 seconds'}
        </p>
      </div>
    </div>
  );

  const renderEmailConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
        <input
          type="email"
          value={config.from || ''}
          onChange={(e) => setConfig({ ...config, from: e.target.value })}
          placeholder="sender@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
        <input
          type="text"
          value={config.to || ''}
          onChange={(e) => setConfig({ ...config, to: e.target.value })}
          placeholder="recipient@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">Separate multiple emails with semicolon</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
        <input
          type="text"
          value={config.cc || ''}
          onChange={(e) => setConfig({ ...config, cc: e.target.value })}
          placeholder="cc@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
        <input
          type="text"
          value={config.subject || ''}
          onChange={(e) => setConfig({ ...config, subject: e.target.value })}
          placeholder="Email subject"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
        <textarea
          value={config.body || ''}
          onChange={(e) => setConfig({ ...config, body: e.target.value })}
          rows={6}
          placeholder="Email message body"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isHtml"
          checked={config.isHtml || false}
          onChange={(e) => setConfig({ ...config, isHtml: e.target.checked })}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isHtml" className="ml-2 text-sm text-gray-700">HTML email</label>
      </div>
      <details className="border border-gray-200 rounded-md">
        <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-gray-700">SMTP Settings</summary>
        <div className="p-3 space-y-3 border-t">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Server</label>
            <input
              type="text"
              value={config.smtpServer || 'localhost'}
              onChange={(e) => setConfig({ ...config, smtpServer: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Port</label>
            <input
              type="number"
              value={config.smtpPort || 25}
              onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={config.smtpUsername || ''}
              onChange={(e) => setConfig({ ...config, smtpUsername: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={config.smtpPassword || ''}
              onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useSsl"
              checked={config.useSsl !== false}
              onChange={(e) => setConfig({ ...config, useSsl: e.target.checked })}
              className="h-3 w-3 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="useSsl" className="ml-2 text-xs text-gray-700">Use SSL</label>
          </div>
        </div>
      </details>
    </div>
  );

  const renderScriptConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">C# Code *</label>
        <textarea
          value={config.code || ''}
          onChange={(e) => setConfig({ ...config, code: e.target.value })}
          rows={15}
          placeholder='// Access: context, previousOutput, inputData\nvar result = previousOutput;\nreturn result;'
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          C# code to execute. Must return a value.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800 font-medium mb-2">Available Variables:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><code className="bg-blue-100 px-1 rounded">context</code> - Workflow execution context (Dictionary)</li>
          <li><code className="bg-blue-100 px-1 rounded">previousOutput</code> - Output from previous node</li>
          <li><code className="bg-blue-100 px-1 rounded">inputData</code> - Workflow input parameters</li>
        </ul>
      </div>
    </div>
  );

  const renderDatabaseConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Database Type *</label>
        <select
          value={config.databaseType || 'PostgreSQL'}
          onChange={(e) => setConfig({ ...config, databaseType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="SqlServer">SQL Server</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Connection String *</label>
        <input
          type="text"
          value={config.connectionString || ''}
          onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
          placeholder="Host=localhost;Database=mydb;Username=user;Password=pass"
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SQL Query *</label>
        <textarea
          value={config.query || ''}
          onChange={(e) => setConfig({ ...config, query: e.target.value })}
          rows={8}
          placeholder="SELECT * FROM users WHERE id = @userId"
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isStoredProcedure"
          checked={config.isStoredProcedure || false}
          onChange={(e) => setConfig({ ...config, isStoredProcedure: e.target.checked })}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isStoredProcedure" className="ml-2 text-sm text-gray-700">Stored Procedure</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parameters (JSON)</label>
        <textarea
          value={config.parameters ? JSON.stringify(config.parameters, null, 2) : '{}'}
          onChange={(e) => {
            try {
              const parameters = JSON.parse(e.target.value);
              setConfig({ ...config, parameters });
            } catch {
              // Invalid JSON
            }
          }}
          rows={4}
          placeholder='{"userId": 123}'
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (node.data.type) {
      case 'httpRequest':
        return renderHttpRequestConfig();
      case 'condition':
        return renderConditionConfig();
      case 'transform':
        return renderTransformConfig();
      case 'delay':
        return renderDelayConfig();
      case 'email':
        return renderEmailConfig();
      case 'script':
        return renderScriptConfig();
      case 'database':
        return renderDatabaseConfig();
      case 'start':
      case 'end':
        return (
          <div className="text-center py-8 text-gray-500">
            <p>This node type has no configuration options.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configure Node</h3>
          <p className="text-sm text-gray-600 mt-1">{node.data.label}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Config Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfig()}
      </div>

      {/* Footer */}
      {!['start', 'end'].includes(node.data.type) && (
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
