import type { WorkflowNode } from '../types/workflow';
import type { Edge } from '@xyflow/react';
import { NodeType } from '../types/workflow';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check 1: Must have at least a start node
  const startNodes = nodes.filter((node) => node.data.type === NodeType.START);
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have a Start node',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      message: 'Workflow can only have one Start node',
    });
  }

  // Check 2: Must have at least an end node
  const endNodes = nodes.filter((node) => node.data.type === NodeType.END);
  if (endNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have an End node',
    });
  }

  // Check 3: All nodes except Start must have incoming edges
  nodes.forEach((node) => {
    if (node.data.type !== NodeType.START) {
      const hasIncoming = edges.some((edge) => edge.target === node.id);
      if (!hasIncoming) {
        warnings.push({
          type: 'warning',
          message: `Node "${node.data.label}" is not connected to any upstream nodes`,
        });
      }
    }
  });

  // Check 4: All nodes except End must have outgoing edges
  nodes.forEach((node) => {
    if (node.data.type !== NodeType.END) {
      const hasOutgoing = edges.some((edge) => edge.source === node.id);
      if (!hasOutgoing) {
        warnings.push({
          type: 'warning',
          message: `Node "${node.data.label}" is not connected to any downstream nodes`,
        });
      }
    }
  });

  // Check 5: Validate that End nodes are reachable from Start
  if (startNodes.length === 1 && endNodes.length > 0) {
    const startNode = startNodes[0];
    const reachableNodes = getReachableNodes(startNode.id, nodes, edges);

    endNodes.forEach((endNode) => {
      if (!reachableNodes.has(endNode.id)) {
        errors.push({
          type: 'error',
          message: `End node "${endNode.data.label}" is not reachable from the Start node`,
        });
      }
    });

    // Check for unreachable nodes
    nodes.forEach((node) => {
      if (node.data.type !== NodeType.START && !reachableNodes.has(node.id)) {
        warnings.push({
          type: 'warning',
          message: `Node "${node.data.label}" is not reachable from the Start node`,
        });
      }
    });
  }

  // Check 6: Validate Condition nodes have both true and false paths
  nodes
    .filter((node) => node.data.type === NodeType.CONDITION)
    .forEach((conditionNode) => {
      const outgoingEdges = edges.filter((edge) => edge.source === conditionNode.id);
      const hasTruePath = outgoingEdges.some((edge) => edge.sourceHandle === 'true');
      const hasFalsePath = outgoingEdges.some((edge) => edge.sourceHandle === 'false');

      if (!hasTruePath && !hasFalsePath) {
        errors.push({
          type: 'error',
          message: `Condition node "${conditionNode.data.label}" must have both true and false paths`,
        });
      } else if (!hasTruePath) {
        warnings.push({
          type: 'warning',
          message: `Condition node "${conditionNode.data.label}" is missing a true path`,
        });
      } else if (!hasFalsePath) {
        warnings.push({
          type: 'warning',
          message: `Condition node "${conditionNode.data.label}" is missing a false path`,
        });
      }
    });

  // Check 7: Validate HTTP Request nodes have URL configured
  nodes
    .filter((node) => node.data.type === NodeType.HTTP_REQUEST)
    .forEach((httpNode) => {
      if (!httpNode.data.config?.url) {
        errors.push({
          type: 'error',
          message: `HTTP Request node "${httpNode.data.label}" must have a URL configured`,
        });
      }
    });

  // Check 8: Validate Condition nodes have condition expression
  nodes
    .filter((node) => node.data.type === NodeType.CONDITION)
    .forEach((conditionNode) => {
      if (!conditionNode.data.config?.condition) {
        errors.push({
          type: 'error',
          message: `Condition node "${conditionNode.data.label}" must have a condition expression`,
        });
      }
    });

  // Check 9: Validate Transform nodes have script configured
  nodes
    .filter((node) => node.data.type === NodeType.TRANSFORM)
    .forEach((transformNode) => {
      if (!transformNode.data.config?.script) {
        errors.push({
          type: 'error',
          message: `Transform node "${transformNode.data.label}" must have a script configured`,
        });
      }
    });

  // Check 10: Validate Delay nodes have duration configured
  nodes
    .filter((node) => node.data.type === NodeType.DELAY)
    .forEach((delayNode) => {
      if (!delayNode.data.config?.duration || delayNode.data.config.duration <= 0) {
        errors.push({
          type: 'error',
          message: `Delay node "${delayNode.data.label}" must have a valid duration configured`,
        });
      }
    });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function getReachableNodes(
  startNodeId: string,
  _nodes: WorkflowNode[],
  edges: Edge[]
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [startNodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    reachable.add(currentId);

    // Find all outgoing edges from current node
    const outgoingEdges = edges.filter((edge) => edge.source === currentId);
    outgoingEdges.forEach((edge) => {
      if (!visited.has(edge.target)) {
        queue.push(edge.target);
      }
    });
  }

  return reachable;
}
