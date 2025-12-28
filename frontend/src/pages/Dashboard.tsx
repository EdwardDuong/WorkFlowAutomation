import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { FiPlus, FiList, FiPlay, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  activeSchedules: number;
  recentExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [workflows, schedules, executions] = await Promise.all([
        api.get('/Workflow'),
        api.get('/ScheduledWorkflow'),
        api.get('/Execution')
      ]);

      const activeWorkflows = workflows.data.filter((w: any) => w.isActive).length;
      const activeSchedules = schedules.data.filter((s: any) => s.isActive).length;

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentExecs = executions.data.filter((e: any) =>
        new Date(e.startedAt) > last24Hours
      );

      const successfulExecs = executions.data.filter((e: any) =>
        e.status === 'Completed'
      ).length;

      const failedExecs = executions.data.filter((e: any) =>
        e.status === 'Failed'
      ).length;

      setStats({
        totalWorkflows: workflows.data.length,
        activeWorkflows,
        totalExecutions: executions.data.length,
        activeSchedules,
        recentExecutions: recentExecs.length,
        successfulExecutions: successfulExecs,
        failedExecutions: failedExecs,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Manage and execute your automated workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Workflow Card */}
        <Link
          to="/dashboard/workflows/new"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <FiPlus className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Create New Workflow
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Design your automation
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* View Workflows Card */}
        <Link
          to="/dashboard/workflows"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FiList className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Workflows
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    View and manage
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* Executions Card */}
        <Link
          to="/dashboard/executions"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FiPlay className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Executions
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    View execution history
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Workflows</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalWorkflows || 0}</p>
                  </div>
                  <FiList className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.activeWorkflows || 0} active
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Schedules</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats?.activeSchedules || 0}</p>
                  </div>
                  <FiClock className="h-8 w-8 text-indigo-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Automated workflows
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Executions</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.totalExecutions || 0}</p>
                  </div>
                  <FiPlay className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.recentExecutions || 0} in last 24h
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats?.totalExecutions ?
                        Math.round((stats.successfulExecutions / stats.totalExecutions) * 100) :
                        0}%
                    </p>
                  </div>
                  <FiCheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.successfulExecutions || 0} succeeded, {stats?.failedExecutions || 0} failed
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
