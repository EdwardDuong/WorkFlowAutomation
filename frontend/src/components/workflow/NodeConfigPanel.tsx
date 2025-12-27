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
      {node.data.type !== 'start' && node.data.type !== 'end' && (
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
