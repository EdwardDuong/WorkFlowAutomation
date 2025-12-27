import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface WorkflowInputDialogProps {
  workflowName: string;
  onClose: () => void;
  onSubmit: (inputData: string) => void;
}

export default function WorkflowInputDialog({
  workflowName,
  onClose,
  onSubmit,
}: WorkflowInputDialogProps) {
  const [inputData, setInputData] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      // Validate JSON
      JSON.parse(inputData);
      setError(null);
      onSubmit(inputData);
    } catch (err) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(inputData);
      setInputData(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError('Cannot format invalid JSON');
    }
  };

  const exampleInputs = [
    {
      name: 'Empty',
      value: '{}',
    },
    {
      name: 'User Data',
      value: JSON.stringify({
        userId: 123,
        name: 'John Doe',
        email: 'john@example.com',
      }, null, 2),
    },
    {
      name: 'API Request',
      value: JSON.stringify({
        endpoint: '/api/users',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, null, 2),
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Run Workflow</h2>
            <p className="mt-1 text-sm text-gray-600">{workflowName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Data (JSON)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Provide input data for this workflow execution. This data will be available to all nodes via the context.
            </p>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              rows={10}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder='{"key": "value"}'
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleFormatJson}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Format JSON
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Example Inputs */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Example Inputs:
            </p>
            <div className="flex gap-2 flex-wrap">
              {exampleInputs.map((example) => (
                <button
                  key={example.name}
                  onClick={() => setInputData(example.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
            <p className="font-medium text-blue-900 mb-1">How to use input data:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Access input in Transform nodes: <code className="bg-blue-100 px-1 rounded">context.inputData</code></li>
              <li>Access input in Condition nodes: <code className="bg-blue-100 px-1 rounded">context.inputData</code></li>
              <li>Previous node output: <code className="bg-blue-100 px-1 rounded">previousOutput</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Run Workflow
          </button>
        </div>
      </div>
    </div>
  );
}
