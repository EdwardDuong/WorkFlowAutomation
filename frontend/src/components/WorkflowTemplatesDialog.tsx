import { useState } from 'react';
import { FiX, FiCopy } from 'react-icons/fi';
import { WORKFLOW_TEMPLATES, getTemplatesByCategory, type WorkflowTemplate } from '../data/workflowTemplates';

interface WorkflowTemplatesDialogProps {
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export default function WorkflowTemplatesDialog({ onClose, onSelectTemplate }: WorkflowTemplatesDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categorizedTemplates = getTemplatesByCategory();
  const categories = ['All', ...Array.from(categorizedTemplates.keys())];

  const filteredTemplates = selectedCategory === 'All'
    ? WORKFLOW_TEMPLATES
    : categorizedTemplates.get(selectedCategory) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workflow Templates</h2>
            <p className="text-sm text-gray-600 mt-1">Start with a pre-built workflow template</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{template.icon}</div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{template.nodes.length} nodes</span>
                  <div className="flex items-center gap-1">
                    <FiCopy size={14} />
                    <span>Use Template</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No templates found in this category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {WORKFLOW_TEMPLATES.length} templates available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
