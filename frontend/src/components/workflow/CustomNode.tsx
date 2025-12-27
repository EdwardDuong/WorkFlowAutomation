import { Handle, Position, useReactFlow } from '@xyflow/react';
import { FiTrash2 } from 'react-icons/fi';
import type { NodeData } from '../../types/workflow';

interface CustomNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
}

export default function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { deleteElements } = useReactFlow();

  const getColorClass = () => {
    switch (data.type) {
      case 'start':
        return 'bg-green-500';
      case 'httpRequest':
        return 'bg-blue-500';
      case 'condition':
        return 'bg-yellow-500';
      case 'transform':
        return 'bg-purple-500';
      case 'delay':
        return 'bg-orange-500';
      case 'end':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md border-2 ${
        selected ? 'border-indigo-600' : 'border-gray-300'
      } bg-white min-w-[150px] relative`}
    >
      {data.type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-500"
        />
      )}

      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md z-10"
          title="Delete node"
        >
          <FiTrash2 size={12} />
        </button>
      )}

      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${getColorClass()} flex items-center justify-center text-white text-sm`}>
          {data.type === 'start' && '▶️'}
          {data.type === 'httpRequest' && '🌐'}
          {data.type === 'condition' && '🔀'}
          {data.type === 'transform' && '⚙️'}
          {data.type === 'delay' && '⏱️'}
          {data.type === 'end' && '🏁'}
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-semibold text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>

      {data.type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-500"
        />
      )}

      {data.type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-3 h-3 !bg-green-500"
          />
          <Handle
            type="source"
            position={Position.Left}
            id="false"
            className="w-3 h-3 !bg-red-500"
          />
        </>
      )}
    </div>
  );
}
