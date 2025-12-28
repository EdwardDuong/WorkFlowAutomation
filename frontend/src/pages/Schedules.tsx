import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Workflow } from '../types';
import { FiPlus, FiEdit, FiTrash2, FiPower, FiClock, FiPlay } from 'react-icons/fi';

interface ScheduledWorkflow {
  id: string;
  workflowId: string;
  workflowName: string;
  cronExpression: string;
  isActive: boolean;
  parameters?: string;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Schedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ScheduledWorkflow[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    workflowId: '',
    cronExpression: '',
    isActive: true,
    parameters: '{}',
  });
  const [paramError, setParamError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesResponse, workflowsResponse] = await Promise.all([
        api.get<ScheduledWorkflow[]>('/ScheduledWorkflow'),
        api.get<Workflow[]>('/Workflow')
      ]);
      setSchedules(schedulesResponse.data);
      setWorkflows(workflowsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON parameters
    try {
      JSON.parse(formData.parameters);
      setParamError(null);
    } catch (err) {
      setParamError('Invalid JSON format');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/ScheduledWorkflow/${editingId}`, formData);
      } else {
        await api.post('/ScheduledWorkflow', formData);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ workflowId: '', cronExpression: '', isActive: true, parameters: '{}' });
      setParamError(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (schedule: ScheduledWorkflow) => {
    setEditingId(schedule.id);
    setFormData({
      workflowId: schedule.workflowId,
      cronExpression: schedule.cronExpression,
      isActive: schedule.isActive,
      parameters: schedule.parameters || '{}',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await api.delete(`/ScheduledWorkflow/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const handleToggleActive = async (schedule: ScheduledWorkflow) => {
    try {
      if (schedule.isActive) {
        await api.post(`/ScheduledWorkflow/${schedule.id}/deactivate`);
      } else {
        await api.post(`/ScheduledWorkflow/${schedule.id}/activate`);
      }
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle schedule');
    }
  };

  const handleRunNow = async (schedule: ScheduledWorkflow) => {
    try {
      const response = await api.post('/Execution/start', {
        workflowId: schedule.workflowId,
        inputData: schedule.parameters || '{}'
      });

      const executionId = response.data.id;
      navigate(`/dashboard/executions/${executionId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start workflow execution');
    }
  };

  const cronExamples = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every day at 9 AM', value: '0 9 * * *' },
    { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Workflows</h1>
          <p className="mt-2 text-sm text-gray-700">
            Automate workflow execution with cron schedules
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ workflowId: '', cronExpression: '', isActive: true, parameters: '{}' });
              setParamError(null);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiPlus className="mr-2" />
            New Schedule
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Schedule' : 'Create New Schedule'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow
                </label>
                <select
                  value={formData.workflowId}
                  onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a workflow</option>
                  {workflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cron Expression
                </label>
                <input
                  type="text"
                  value={formData.cronExpression}
                  onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  placeholder="* * * * *"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: minute hour day month day-of-week
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cronExamples.map((example) => (
                    <button
                      key={example.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, cronExpression: example.value })}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Parameters (JSON)
                </label>
                <textarea
                  value={formData.parameters}
                  onChange={(e) => {
                    setFormData({ ...formData, parameters: e.target.value });
                    setParamError(null);
                  }}
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(formData.parameters);
                        setFormData({ ...formData, parameters: JSON.stringify(parsed, null, 2) });
                        setParamError(null);
                      } catch (err) {
                        setParamError('Cannot format invalid JSON');
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Format JSON
                  </button>
                  {paramError && (
                    <span className="text-xs text-red-600">{paramError}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Default input parameters for scheduled executions
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {editingId ? 'Update Schedule' : 'Create Schedule'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setParamError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiClock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new schedule.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <li key={schedule.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">
                          {schedule.workflowName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          {schedule.cronExpression}
                        </p>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          schedule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Last Run:</span>{' '}
                        {schedule.lastRunAt
                          ? new Date(schedule.lastRunAt).toLocaleString()
                          : 'Never'}
                      </div>
                      <div>
                        <span className="font-medium">Next Run:</span>{' '}
                        {schedule.nextRunAt
                          ? new Date(schedule.nextRunAt).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleRunNow(schedule)}
                      className="inline-flex items-center p-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                      title="Run Now"
                    >
                      <FiPlay />
                    </button>
                    <button
                      onClick={() => handleToggleActive(schedule)}
                      className={`inline-flex items-center p-2 border rounded-md text-sm font-medium ${
                        schedule.isActive
                          ? 'border-yellow-300 text-yellow-700 bg-white hover:bg-yellow-50'
                          : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
                      }`}
                      title={schedule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <FiPower />
                    </button>
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
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
