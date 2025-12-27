import { NODE_CONFIGS } from '../../types/workflow';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Types</h3>
      <div className="space-y-2">
        {NODE_CONFIGS.map((config) => (
          <div
            key={config.id}
            draggable
            onDragStart={(e) => onDragStart(e, config.type)}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{config.icon}</span>
              <span className="font-medium text-gray-900">{config.label}</span>
            </div>
            <p className="text-xs text-gray-600 ml-7">{config.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
