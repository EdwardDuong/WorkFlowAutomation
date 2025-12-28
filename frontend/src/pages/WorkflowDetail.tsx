import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { Workflow, WorkflowExecution } from '../types';
import { FiArrowLeft, FiEdit, FiPlay, FiTrash2, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import WorkflowInputDialog from '../components/WorkflowInputDialog';

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInputDialog, setShowInputDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [workflowResponse, executionsResponse] = await Promise.all([
        api.get<Workflow>(`/Workflow/${id}`),
        api.get<WorkflowExecution[]>(`/Execution`)
      ]);

      setWorkflow(workflowResponse.data);
      // Filter executions for this workflow
      const workflowExecutions = executionsResponse.data.filter(
        (exec) => exec.workflowId === id
      );
      // Sort by creation date descending
      workflowExecutions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setExecutions(workflowExecutions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch workflow details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workflow || !window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await api.delete(`/Workflow/${workflow.id}`);
      toast.success('Workflow deleted successfully');
      navigate('/dashboard/workflows');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete workflow');
    }
  };

  const handleRunWorkflow = async (inputData: string) => {
    if (!workflow) return;

    try {
      const response = await api.post('/Execution/start', {
        workflowId: workflow.id,
        inputData
      });

      const executionId = response.data.id;
      setShowInputDialog(false);
      toast.success('Workflow execution started');
      navigate(`/dashboard/executions/${executionId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start workflow execution');
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

  const getSuccessRate = () => {
    if (executions.length === 0) return 0;
    const completed = executions.filter(e => e.status === 2).length;
    return Math.round((completed / executions.length) * 100);
  };

  const getAverageDuration = () => {
    const completedExecutions = executions.filter(e => e.startedAt && e.completedAt);
    if (completedExecutions.length === 0) return 'N/A';

    const totalMs = completedExecutions.reduce((sum, exec) => {
      const duration = new Date(exec.completedAt!).getTime() - new Date(exec.startedAt!).getTime();
      return sum + duration;
    }, 0);

    const avgMs = totalMs / completedExecutions.length;
    const avgSeconds = Math.floor(avgMs / 1000);
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = avgSeconds % 60;

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Workflow not found'}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/dashboard/workflows"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <FiArrowLeft className="mr-1" />
          Back to Workflows
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {workflow.description || 'No description'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                workflow.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {workflow.isActive ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={() => setShowInputDialog(true)}
              disabled={!workflow.isActive}
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
            >
              <FiPlay className="mr-2" />
              Run
            </button>
            <Link
              to={`/dashboard/workflows/${workflow.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiEdit className="mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Executions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{executions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Success Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{getSuccessRate()}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {executions.filter(e => e.status === 3).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Avg Duration</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{getAverageDuration()}</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
          <p className="text-sm text-gray-600 mt-1">Recent execution history</p>
        </div>

        {executions.length === 0 ? (
          <div className="text-center py-12">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No executions yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              This workflow hasn't been executed yet.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {executions.map((execution, idx) => (
                  <li key={execution.id}>
                    <div className="relative pb-8">
                      {idx !== executions.length - 1 && (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div>
                          <div className="relative px-1">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              execution.status === 2 ? 'bg-green-500' :
                              execution.status === 3 ? 'bg-red-500' :
                              execution.status === 1 ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`}>
                              {execution.status === 2 ? <FiCheckCircle className="h-5 w-5 text-white" /> :
                               execution.status === 3 ? <FiXCircle className="h-5 w-5 text-white" /> :
                               <FiClock className="h-5 w-5 text-white" />}
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(execution.status)}
                                <span className="text-sm text-gray-500">
                                  {new Date(execution.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <Link
                                to={`/dashboard/executions/${execution.id}`}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                View Details
                              </Link>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium">Duration:</span> {formatDuration(execution.startedAt, execution.completedAt)}
                                </div>
                                <div>
                                  <span className="font-medium">ID:</span> {execution.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                            {execution.errorMessage && (
                              <div className="mt-2 text-sm text-red-600">
                                <span className="font-medium">Error:</span> {execution.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {showInputDialog && (
        <WorkflowInputDialog
          workflowName={workflow.name}
          onClose={() => setShowInputDialog(false)}
          onSubmit={handleRunWorkflow}
        />
      )}
    </div>
  );
}
