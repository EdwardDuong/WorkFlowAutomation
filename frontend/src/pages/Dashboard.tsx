import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { FiPlus, FiList, FiPlay } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuthStore();

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
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Workflows</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Executions</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
