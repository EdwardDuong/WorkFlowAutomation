import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { Workflow, WorkflowDetail, CreateWorkflowRequest, WorkflowNodeRequest, WorkflowEdgeRequest } from '../types';
import { FiPlus, FiEdit, FiTrash2, FiPlay, FiCopy, FiSearch } from 'react-icons/fi';
import WorkflowInputDialog from '../components/WorkflowInputDialog';
import Pagination from '../components/Pagination';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await api.delete(`/Workflow/${id}`);
      setWorkflows(workflows.filter((w) => w.id !== id));
      toast.success('Workflow deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete workflow');
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
      toast.success('Workflow execution started');
      navigate(`/dashboard/executions/${executionId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start workflow execution');
    }
  };

  const handleClone = async (id: string) => {
    try {
      // Fetch the full workflow with nodes and edges
      const response = await api.get<WorkflowDetail>(`/Workflow/${id}/with-nodes`);
      const originalWorkflow = response.data;

      // Create a new workflow with copied data
      const clonedWorkflow: CreateWorkflowRequest = {
        name: `Copy of ${originalWorkflow.name}`,
        description: originalWorkflow.description || '',
        isActive: false, // Set to inactive by default
        nodes: originalWorkflow.nodes?.map((node): WorkflowNodeRequest => ({
          nodeId: node.nodeId,
          nodeType: node.nodeType,
          label: node.label || '',
          positionX: node.positionX || 0,
          positionY: node.positionY || 0,
          configurationJson: node.configurationJson || '{}',
        })) || [],
        edges: originalWorkflow.edges?.map((edge): WorkflowEdgeRequest => ({
          edgeId: edge.edgeId,
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          edgeType: edge.edgeType,
        })) || [],
      };

      // Create the new workflow
      const createResponse = await api.post<Workflow>('/Workflow', clonedWorkflow);

      // Refresh the workflows list
      await fetchWorkflows();

      toast.success('Workflow cloned successfully');

      // Navigate to edit the cloned workflow
      navigate(`/dashboard/workflows/${createResponse.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clone workflow');
    }
  };

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      // Filter by search query
      const matchesSearch =
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (workflow.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && workflow.isActive) ||
        (statusFilter === 'inactive' && !workflow.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchQuery, statusFilter]);

  const paginatedWorkflows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredWorkflows.slice(startIndex, endIndex);
  }, [filteredWorkflows, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedWorkflows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedWorkflows.map(w => w.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} workflow(s)?`)) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => api.delete(`/Workflow/${id}`))
      );
      await fetchWorkflows();
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} workflow(s) deleted successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete workflows');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedIds.size === 0) return;

    setBulkActionLoading(true);
    try {
      const updatePromises = Array.from(selectedIds).map(async (id) => {
        const workflow = workflows.find(w => w.id === id);
        if (workflow) {
          return api.put(`/Workflow/${id}`, {
            name: workflow.name,
            description: workflow.description,
            isActive: true
          });
        }
      });
      await Promise.all(updatePromises);
      await fetchWorkflows();
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} workflow(s) activated successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to activate workflows');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) return;

    setBulkActionLoading(true);
    try {
      const updatePromises = Array.from(selectedIds).map(async (id) => {
        const workflow = workflows.find(w => w.id === id);
        if (workflow) {
          return api.put(`/Workflow/${id}`, {
            name: workflow.name,
            description: workflow.description,
            isActive: false
          });
        }
      });
      await Promise.all(updatePromises);
      await fetchWorkflows();
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} workflow(s) deactivated successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to deactivate workflows');
    } finally {
      setBulkActionLoading(false);
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

      {workflows.length > 0 && (
        <>
          <div className="mb-4 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'active'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'inactive'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="mb-4 bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-900">
                  {selectedIds.size} workflow(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkActivate}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Activate
                  </button>
                  <button
                    onClick={handleBulkDeactivate}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
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
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === paginatedWorkflows.length && paginatedWorkflows.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium">Select All (on this page)</span>
              </label>
            </div>
            <ul className="divide-y divide-gray-200">
              {paginatedWorkflows.map((workflow) => (
              <li key={workflow.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(workflow.id)}
                        onChange={() => handleToggleSelect(workflow.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/dashboard/workflows/${workflow.id}/detail`}
                            className="text-sm font-medium text-indigo-600 truncate hover:text-indigo-800"
                          >
                            {workflow.name}
                          </Link>
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
                      <button
                        onClick={() => handleClone(workflow.id)}
                        className="inline-flex items-center p-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                        title="Clone Workflow"
                      >
                        <FiCopy />
                      </button>
                      <Link
                        to={`/dashboard/workflows/${workflow.id}/edit`}
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredWorkflows.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </>
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
