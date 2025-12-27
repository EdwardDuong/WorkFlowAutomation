import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiPlay } from 'react-icons/fi';

interface Execution {
  id: string;
  workflowId: string;
  userId: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  startedAt?: string;
  completedAt?: string;
  executionContextJson: string;
  errorMessage?: string;
  createdAt: string;
}

interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  startedAt?: string;
  completedAt?: string;
  inputData?: string;
  outputData?: string;
  errorMessage?: string;
}

export default function ExecutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchExecutionDetails();
    }
  }, [id]);

  useEffect(() => {
    // Auto-refresh if execution is still running
    if (execution?.status === 'Running' || execution?.status === 'Pending') {
      const interval = setInterval(() => {
        fetchExecutionDetails();
      }, 2000); // Refresh every 2 seconds

      return () => clearInterval(interval);
    }
  }, [execution?.status]);

  const fetchExecutionDetails = async () => {
    try {
      setLoading(true);
      const [execResponse, logsResponse] = await Promise.all([
        api.get<Execution>(`/Execution/${id}`),
        api.get<ExecutionLog[]>(`/Execution/${id}/logs`)
      ]);

      setExecution(execResponse.data);
      setLogs(logsResponse.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch execution details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-50';
      case 'Failed':
        return 'text-red-600 bg-red-50';
      case 'Running':
        return 'text-blue-600 bg-blue-50';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <FiCheckCircle className="text-green-600" />;
      case 'Failed':
        return <FiXCircle className="text-red-600" />;
      case 'Running':
        return <FiPlay className="text-blue-600 animate-pulse" />;
      case 'Pending':
        return <FiClock className="text-yellow-600" />;
      default:
        return <FiClock className="text-gray-600" />;
    }
  };

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return 'N/A';

    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const durationMs = end.getTime() - start.getTime();

    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatJson = (jsonString?: string) => {
    if (!jsonString) return 'N/A';
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  if (loading && !execution) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !execution) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Execution not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/workflows')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Workflows
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Execution Details</h1>
        </div>
      </div>

      {/* Execution Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className={`mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(execution.status)}`}>
              {getStatusIcon(execution.status)}
              <span className="font-semibold">{execution.status}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Started At</p>
            <p className="mt-2 text-sm text-gray-900">
              {execution.startedAt
                ? new Date(execution.startedAt).toLocaleString()
                : 'Not started'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Completed At</p>
            <p className="mt-2 text-sm text-gray-900">
              {execution.completedAt
                ? new Date(execution.completedAt).toLocaleString()
                : 'In progress'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="mt-2 text-sm text-gray-900">
              {formatDuration(execution.startedAt, execution.completedAt)}
            </p>
          </div>
        </div>

        {execution.errorMessage && (
          <div className="mt-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error:</p>
            <p className="mt-1">{execution.errorMessage}</p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">Execution Context</p>
          <pre className="mt-2 bg-gray-50 border border-gray-200 rounded p-4 text-xs overflow-x-auto">
            {formatJson(execution.executionContextJson)}
          </pre>
        </div>
      </div>

      {/* Execution Logs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Execution Logs</h2>
          <p className="mt-1 text-sm text-gray-500">
            Node-by-node execution details
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No execution logs available
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.nodeType} Node
                        </p>
                        <p className="text-xs text-gray-500">
                          Node ID: {log.nodeId}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Started</p>
                        <p className="mt-1 text-gray-900">
                          {log.startedAt
                            ? new Date(log.startedAt).toLocaleTimeString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Completed</p>
                        <p className="mt-1 text-gray-900">
                          {log.completedAt
                            ? new Date(log.completedAt).toLocaleTimeString()
                            : 'In progress'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="mt-1 text-gray-900">
                          {formatDuration(log.startedAt, log.completedAt)}
                        </p>
                      </div>
                    </div>

                    {log.inputData && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Input:</p>
                        <pre className="mt-1 bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto">
                          {formatJson(log.inputData)}
                        </pre>
                      </div>
                    )}

                    {log.outputData && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Output:</p>
                        <pre className="mt-1 bg-blue-50 border border-blue-200 rounded p-2 text-xs overflow-x-auto">
                          {formatJson(log.outputData)}
                        </pre>
                      </div>
                    )}

                    {log.errorMessage && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-700">Error:</p>
                        <pre className="mt-1 bg-red-50 border border-red-200 rounded p-2 text-xs overflow-x-auto text-red-700">
                          {log.errorMessage}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                    {log.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
