import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../lib/api';
import type { CreateWorkflowRequest, WorkflowNodeRequest, WorkflowEdgeRequest, WorkflowDetail } from '../types';
import { NodeType } from '../types/workflow';
import type { WorkflowNode } from '../types/workflow';
import CustomNode from '../components/workflow/CustomNode';
import NodePalette from '../components/workflow/NodePalette';
import NodeConfigPanel from '../components/workflow/NodeConfigPanel';
import WorkflowTemplatesDialog from '../components/WorkflowTemplatesDialog';
import { validateWorkflow, type ValidationError } from '../utils/workflowValidation';
import type { WorkflowTemplate } from '../data/workflowTemplates';
import { toast } from 'sonner';

const nodeTypes = {
  start: CustomNode,
  httpRequest: CustomNode,
  condition: CustomNode,
  transform: CustomNode,
  delay: CustomNode,
  end: CustomNode,
  email: CustomNode,
  script: CustomNode,
  database: CustomNode,
};

const initialNodes: WorkflowNode[] = [
  {
    id: '1',
    type: NodeType.START,
    position: { x: 250, y: 25 },
    data: { label: 'Start', type: NodeType.START },
  },
];

// Map NodeType enum to backend enum values
const nodeTypeToNumber = (type: NodeType): number => {
  switch (type) {
    case NodeType.START: return 0;
    case NodeType.HTTP_REQUEST: return 1;
    case NodeType.DELAY: return 2;
    case NodeType.CONDITION: return 3;
    case NodeType.TRANSFORM: return 4;
    case NodeType.END: return 5;
    case NodeType.EMAIL: return 6;
    case NodeType.SCRIPT: return 7;
    case NodeType.DATABASE: return 8;
    default: return 0;
  }
};

// Map backend enum values to NodeType enum
const numberToNodeType = (num: number): NodeType => {
  switch (num) {
    case 0: return NodeType.START;
    case 1: return NodeType.HTTP_REQUEST;
    case 2: return NodeType.DELAY;
    case 3: return NodeType.CONDITION;
    case 4: return NodeType.TRANSFORM;
    case 5: return NodeType.END;
    case 6: return NodeType.EMAIL;
    case 7: return NodeType.SCRIPT;
    case 8: return NodeType.DATABASE;
    default: return NodeType.START;
  }
};

export default function WorkflowDesigner() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationError[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Load existing workflow if editing
  useEffect(() => {
    const loadWorkflow = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await api.get<WorkflowDetail>(`/Workflow/${id}/with-nodes`);
        const workflow = response.data;

        setName(workflow.name);
        setDescription(workflow.description || '');
        setIsActive(workflow.isActive);

        // Convert backend nodes to React Flow format
        if (workflow.nodes && workflow.nodes.length > 0) {
          const flowNodes: WorkflowNode[] = workflow.nodes.map((node) => ({
            id: node.nodeId,
            type: numberToNodeType(node.nodeType),
            position: { x: node.positionX || 0, y: node.positionY || 0 },
            data: {
              label: node.label || '',
              type: numberToNodeType(node.nodeType),
              config: node.configurationJson ? JSON.parse(node.configurationJson) : {},
            },
          }));
          setNodes(flowNodes);
        }

        // Convert backend edges to React Flow format
        if (workflow.edges && workflow.edges.length > 0) {
          const flowEdges = workflow.edges.map((edge) => ({
            id: edge.edgeId,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
            type: edge.edgeType || undefined,
          }));
          setEdges(flowEdges);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `${Date.now()}`,
        type: type as NodeType,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          type: type as NodeType,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: WorkflowNode) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleConfigUpdate = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleValidate = useCallback(() => {
    const result = validateWorkflow(nodes, edges);
    setValidationErrors(result.errors);
    setValidationWarnings(result.warnings);
    return result;
  }, [nodes, edges]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Validate workflow before saving
    const validationResult = handleValidate();
    if (!validationResult.isValid) {
      setError('Please fix validation errors before saving');
      setSaving(false);
      return;
    }

    try {
      // Convert React Flow nodes to backend format
      const workflowNodes: WorkflowNodeRequest[] = nodes.map((node) => ({
        nodeId: node.id,
        nodeType: nodeTypeToNumber(node.data.type),
        label: node.data.label,
        positionX: node.position.x,
        positionY: node.position.y,
        configurationJson: JSON.stringify(node.data.config || {}),
      }));

      // Convert React Flow edges to backend format
      const workflowEdges: WorkflowEdgeRequest[] = edges.map((edge) => ({
        edgeId: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        edgeType: edge.type || undefined,
      }));

      const workflowData: CreateWorkflowRequest = {
        name,
        description,
        isActive,
        nodes: workflowNodes,
        edges: workflowEdges,
      };

      if (id) {
        // Update existing workflow
        await api.put(`/Workflow/${id}/full`, workflowData);
      } else {
        // Create new workflow
        await api.post('/Workflow', workflowData);
      }

      navigate('/dashboard/workflows');
    } catch (err: any) {
      setError(err.response?.data?.message || (id ? 'Failed to update workflow' : 'Failed to create workflow'));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = useCallback((template: WorkflowTemplate) => {
    // Load template nodes and edges
    setNodes(template.nodes as WorkflowNode[]);
    setEdges(template.edges as Edge[]);

    // Optionally set name and description if not editing an existing workflow
    if (!id) {
      setName(template.name);
      setDescription(template.description);
    }

    setShowTemplatesDialog(false);
    toast.success(`Template "${template.name}" loaded successfully`);
  }, [id, setNodes, setEdges]);

  const handleExportWorkflow = useCallback(() => {
    const workflowData = {
      name,
      description,
      isActive,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
      })),
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name || 'workflow'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Workflow exported successfully');
  }, [name, description, isActive, nodes, edges]);

  const handleImportWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const workflowData = JSON.parse(text);

        // Validate the imported data
        if (!workflowData.nodes || !workflowData.edges) {
          throw new Error('Invalid workflow file format');
        }

        // Load the workflow data
        setName(workflowData.name || 'Imported Workflow');
        setDescription(workflowData.description || '');
        setIsActive(workflowData.isActive !== undefined ? workflowData.isActive : true);
        setNodes(workflowData.nodes);
        setEdges(workflowData.edges);

        toast.success('Workflow imported successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to import workflow');
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading workflow...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Workflow' : 'Create New Workflow'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Design and configure your automated workflow
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <NodePalette onDragStart={onDragStart} />

        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="My Automation Workflow"
                  maxLength={255}
                />
              </div>

              <div className="flex-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe what this workflow does..."
                  maxLength={1000}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-900">
                  Active
                </label>
              </div>

              <button
                onClick={() => setShowTemplatesDialog(true)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Templates
              </button>
              <button
                onClick={handleImportWorkflow}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Import
              </button>
              <button
                onClick={handleExportWorkflow}
                disabled={!name || nodes.length === 0}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Export
              </button>
              <button
                onClick={handleValidate}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Validate
              </button>
              <button
                onClick={() => navigate('/dashboard/workflows')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {saving ? (id ? 'Updating...' : 'Saving...') : (id ? 'Update Workflow' : 'Save Workflow')}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-semibold mb-2">Validation Errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((err, index) => (
                    <li key={index}>{err.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationWarnings.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p className="font-semibold mb-2">Validation Warnings:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationWarnings.map((warn, index) => (
                    <li key={index}>{warn.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex-1 flex">
            <div ref={reactFlowWrapper} className="flex-1">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                fitView
              >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              </ReactFlow>
            </div>

            {selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdate={handleConfigUpdate}
              />
            )}
          </div>
        </div>
      </div>

      {showTemplatesDialog && (
        <WorkflowTemplatesDialog
          onClose={() => setShowTemplatesDialog(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </div>
  );
}
