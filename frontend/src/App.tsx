import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import WorkflowDesigner from './pages/WorkflowDesigner';
import Executions from './pages/Executions';
import ExecutionDetail from './pages/ExecutionDetail';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="workflows/new" element={<WorkflowDesigner />} />
          <Route path="workflows/:id" element={<WorkflowDesigner />} />
          <Route path="executions" element={<Executions />} />
          <Route path="executions/:id" element={<ExecutionDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
