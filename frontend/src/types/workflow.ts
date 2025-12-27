import type { Node } from '@xyflow/react';

export type NodeType =
  | 'start'
  | 'httpRequest'
  | 'condition'
  | 'transform'
  | 'delay'
  | 'end';

export const NodeType = {
  START: 'start' as const,
  HTTP_REQUEST: 'httpRequest' as const,
  CONDITION: 'condition' as const,
  TRANSFORM: 'transform' as const,
  DELAY: 'delay' as const,
  END: 'end' as const,
};

export interface NodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  config?: Record<string, any>;
}

export interface WorkflowNode extends Node<NodeData> {
  data: NodeData;
  type: NodeType;
}

export interface NodeConfig {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig?: Record<string, any>;
}

export const NODE_CONFIGS: NodeConfig[] = [
  {
    id: 'start',
    type: NodeType.START,
    label: 'Start',
    description: 'Workflow entry point',
    icon: '▶️',
    color: 'bg-green-500',
  },
  {
    id: 'http-request',
    type: NodeType.HTTP_REQUEST,
    label: 'HTTP Request',
    description: 'Make an HTTP API call',
    icon: '🌐',
    color: 'bg-blue-500',
    defaultConfig: {
      method: 'GET',
      url: '',
      headers: {},
      body: '',
    },
  },
  {
    id: 'condition',
    type: NodeType.CONDITION,
    label: 'Condition',
    description: 'Branch based on condition',
    icon: '🔀',
    color: 'bg-yellow-500',
    defaultConfig: {
      condition: '',
    },
  },
  {
    id: 'transform',
    type: NodeType.TRANSFORM,
    label: 'Transform Data',
    description: 'Transform or map data',
    icon: '⚙️',
    color: 'bg-purple-500',
    defaultConfig: {
      script: '',
    },
  },
  {
    id: 'delay',
    type: NodeType.DELAY,
    label: 'Delay',
    description: 'Wait for a period of time',
    icon: '⏱️',
    color: 'bg-orange-500',
    defaultConfig: {
      duration: 1000,
    },
  },
  {
    id: 'end',
    type: NodeType.END,
    label: 'End',
    description: 'Workflow completion',
    icon: '🏁',
    color: 'bg-red-500',
  },
];
