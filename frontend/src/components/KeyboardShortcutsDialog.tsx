import { FiX } from 'react-icons/fi';

interface KeyboardShortcutsDialogProps {
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['W'], description: 'Go to Workflows', category: 'Navigation' },
  { keys: ['E'], description: 'Go to Executions', category: 'Navigation' },
  { keys: ['S'], description: 'Go to Schedules', category: 'Navigation' },

  // Actions
  { keys: ['N'], description: 'New Workflow (on Workflows page)', category: 'Actions' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Actions' },
  { keys: ['Esc'], description: 'Close dialog', category: 'Actions' },
];

export default function KeyboardShortcutsDialog({ onClose }: KeyboardShortcutsDialogProps) {
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
            <p className="text-sm text-gray-600 mt-1">Navigate faster with keyboard shortcuts</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.map(category => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, idx) => (
                          <kbd
                            key={idx}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded">?</kbd> anytime to view this dialog
          </p>
        </div>
      </div>
    </div>
  );
}
