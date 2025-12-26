import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { WorkflowExecution } from '../types';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export default function Executions() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await api.get<WorkflowExecution[]>('/Execution');
      setExecutions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch executions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statuses = [
      { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: FiClock },
      { label: 'Running', color: 'bg-blue-100 text-blue-800', icon: FiClock },
      { label: 'Completed', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
      { label: 'Failed', color: 'bg-red-100 text-red-800', icon: FiXCircle },
      { label: 'Cancelled', color: 'bg-yellow-100 text-yellow-800', icon: FiAlertCircle },
    ];

    const statusInfo = statuses[status] || statuses[0];
    const Icon = statusInfo.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        <Icon className="mr-1" size={12} />
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Executions</h1>
        <p className="mt-2 text-sm text-gray-700">
          View the history of all workflow executions
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {executions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiClock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No executions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Workflow executions will appear here once you start running workflows.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {executions.map((execution) => (
              <li key={execution.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600">
                          Execution ID: {execution.id.substring(0, 8)}...
                        </p>
                        {getStatusBadge(execution.status)}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Started:</span>{' '}
                          {execution.startedAt
                            ? new Date(execution.startedAt).toLocaleString()
                            : 'Not started'}
                        </div>
                        <div>
                          <span className="font-medium">Completed:</span>{' '}
                          {execution.completedAt
                            ? new Date(execution.completedAt).toLocaleString()
                            : 'In progress'}
                        </div>
                      </div>
                      {execution.errorMessage && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {execution.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
