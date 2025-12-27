import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Workflow } from '../types';
import { FiPlus, FiEdit, FiTrash2, FiPlay } from 'react-icons/fi';
import WorkflowInputDialog from '../components/WorkflowInputDialog';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await api.get<Workflow[]>('/Workflow');
      setWorkflows(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await api.delete(`/Workflow/${id}`);
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete workflow');
    }
  };

  const handleRunClick = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleRunWorkflow = async (inputData: string) => {
    if (!selectedWorkflow) return;

    try {
      const response = await api.post('/Execution/start', {
        workflowId: selectedWorkflow.id,
        inputData
      });

      const executionId = response.data.id;
      setSelectedWorkflow(null);
      navigate(`/dashboard/executions/${executionId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start workflow execution');
    }
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
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Workflows</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your automated workflows
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/workflows/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="mr-2" />
            New Workflow
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiPlus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new workflow.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/workflows/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiPlus className="mr-2" />
              New Workflow
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {workflows.map((workflow) => (
              <li key={workflow.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {workflow.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              workflow.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {workflow.description || 'No description'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>
                          Created: {new Date(workflow.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleRunClick(workflow)}
                        disabled={!workflow.isActive}
                        className="inline-flex items-center p-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Run Workflow"
                      >
                        <FiPlay />
                      </button>
                      <Link
                        to={`/dashboard/workflows/${workflow.id}`}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        title="Edit"
                      >
                        <FiEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedWorkflow && (
        <WorkflowInputDialog
          workflowName={selectedWorkflow.name}
          onClose={() => setSelectedWorkflow(null)}
          onSubmit={handleRunWorkflow}
        />
      )}
    </div>
  );
}
