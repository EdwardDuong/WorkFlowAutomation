import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { WorkflowExecution, Workflow } from '../types';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw, FiEye, FiRotateCw } from 'react-icons/fi';

export default function Executions() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [executionsResponse, workflowsResponse] = await Promise.all([
        api.get<WorkflowExecution[]>('/Execution'),
        api.get<Workflow[]>('/Workflow')
      ]);
      setExecutions(executionsResponse.data);
      setWorkflows(workflowsResponse.data);
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

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow?.name || 'Unknown Workflow';
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
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleRetry = async (execution: WorkflowExecution, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();

    try {
      // Try to extract input data from execution context
      let inputData = '{}';
      try {
        const context = JSON.parse(execution.executionContextJson || '{}');
        if (context.inputData) {
          inputData = typeof context.inputData === 'string' ? context.inputData : JSON.stringify(context.inputData);
        }
      } catch {
        // If parsing fails, use empty object
        inputData = '{}';
      }

      const response = await api.post('/Execution/start', {
        workflowId: execution.workflowId,
        inputData
      });

      const executionId = response.data.id;
      toast.success('Workflow execution retried successfully');
      navigate(`/dashboard/executions/${executionId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retry workflow execution');
    }
  };

  const filteredExecutions = executions.filter((execution) => {
    const statusMatch = statusFilter === 'all' || execution.status.toString() === statusFilter;
    const workflowMatch = workflowFilter === 'all' || execution.workflowId === workflowFilter;
    return statusMatch && workflowMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Executions</h1>
          <p className="mt-2 text-sm text-gray-700">
            View the history of all workflow executions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="0">Pending</option>
              <option value="1">Running</option>
              <option value="2">Completed</option>
              <option value="3">Failed</option>
              <option value="4">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="workflow-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Workflow
            </label>
            <select
              id="workflow-filter"
              value={workflowFilter}
              onChange={(e) => setWorkflowFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Workflows</option>
              {workflows.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-500">
          Showing {filteredExecutions.length} of {executions.length} executions
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {filteredExecutions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiClock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {executions.length === 0 ? 'No executions' : 'No matching executions'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {executions.length === 0
              ? 'Workflow executions will appear here once you start running workflows.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredExecutions.map((execution) => (
              <li key={execution.id}>
                <Link
                  to={`/dashboard/executions/${execution.id}`}
                  className="block px-4 py-4 sm:px-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600">
                            {getWorkflowName(execution.workflowId)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {execution.id.substring(0, 8)}...
                          </p>
                        </div>
                        {getStatusBadge(execution.status)}
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Started:</span>{' '}
                          {execution.startedAt
                            ? new Date(execution.startedAt).toLocaleString()
                            : 'Not started'}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>{' '}
                          {formatDuration(execution.startedAt, execution.completedAt)}
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
                    <div className="ml-4 flex items-center space-x-3">
                      {execution.status === 3 && ( // Failed status
                        <button
                          onClick={(e) => handleRetry(execution, e)}
                          className="inline-flex items-center p-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                          title="Retry Execution"
                        >
                          <FiRotateCw />
                        </button>
                      )}
                      <FiEye className="text-gray-400" size={20} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
