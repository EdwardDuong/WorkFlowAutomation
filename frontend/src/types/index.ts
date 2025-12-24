export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateWorkflowRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface WorkflowNode {
  id: string;
  nodeId: string;
  nodeType: number;
  label?: string;
  positionX?: number;
  positionY?: number;
  configurationJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowEdge {
  id: string;
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
  edgeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDetail extends Workflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId?: string;
  status: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  executionContextJson: string;
  createdAt: string;
  updatedAt: string;
  duration?: string;
}

export interface StartExecutionRequest {
  workflowId: string;
  inputData?: string;
}
