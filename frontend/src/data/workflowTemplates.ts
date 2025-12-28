import { NodeType } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: {
      label: string;
      type: NodeType;
      config?: Record<string, any>;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'daily-report-email',
    name: 'Daily Report Email',
    description: 'Fetch data from an API and send a daily email report',
    category: 'Automation',
    icon: '📊',
    nodes: [
      {
        id: '1',
        type: NodeType.START,
        position: { x: 250, y: 50 },
        data: { label: 'Start', type: NodeType.START },
      },
      {
        id: '2',
        type: NodeType.HTTP_REQUEST,
        position: { x: 250, y: 150 },
        data: {
          label: 'Fetch Report Data',
          type: NodeType.HTTP_REQUEST,
          config: {
            method: 'GET',
            url: 'https://api.example.com/daily-stats',
            headers: { 'Content-Type': 'application/json' },
          },
        },
      },
      {
        id: '3',
        type: NodeType.SCRIPT,
        position: { x: 250, y: 280 },
        data: {
          label: 'Format Report',
          type: NodeType.SCRIPT,
          config: {
            code: `var data = previousOutput;
var report = $"<h1>Daily Report</h1><p>Status: {data.StatusCode}</p>";
return report;`,
          },
        },
      },
      {
        id: '4',
        type: NodeType.EMAIL,
        position: { x: 250, y: 410 },
        data: {
          label: 'Send Email',
          type: NodeType.EMAIL,
          config: {
            to: 'team@company.com',
            subject: 'Daily Report',
            body: '',
            isHtml: true,
          },
        },
      },
      {
        id: '5',
        type: NodeType.END,
        position: { x: 250, y: 540 },
        data: { label: 'End', type: NodeType.END },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
    ],
  },
  {
    id: 'data-sync',
    name: 'Database Sync',
    description: 'Sync data between an API and a database',
    category: 'Integration',
    icon: '🔄',
    nodes: [
      {
        id: '1',
        type: NodeType.START,
        position: { x: 250, y: 50 },
        data: { label: 'Start', type: NodeType.START },
      },
      {
        id: '2',
        type: NodeType.HTTP_REQUEST,
        position: { x: 250, y: 150 },
        data: {
          label: 'Fetch from API',
          type: NodeType.HTTP_REQUEST,
          config: {
            method: 'GET',
            url: 'https://api.example.com/users',
            headers: {},
          },
        },
      },
      {
        id: '3',
        type: NodeType.TRANSFORM,
        position: { x: 250, y: 280 },
        data: {
          label: 'Transform Data',
          type: NodeType.TRANSFORM,
          config: {
            script: 'return { users: previousOutput.Body };',
          },
        },
      },
      {
        id: '4',
        type: NodeType.DATABASE,
        position: { x: 250, y: 410 },
        data: {
          label: 'Insert to DB',
          type: NodeType.DATABASE,
          config: {
            databaseType: 'PostgreSQL',
            connectionString: '',
            query: 'INSERT INTO users (name, email) VALUES (@name, @email)',
          },
        },
      },
      {
        id: '5',
        type: NodeType.END,
        position: { x: 250, y: 540 },
        data: { label: 'End', type: NodeType.END },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
    ],
  },
  {
    id: 'conditional-notification',
    name: 'Conditional Alert',
    description: 'Check API health and send alert if unhealthy',
    category: 'Monitoring',
    icon: '🚨',
    nodes: [
      {
        id: '1',
        type: NodeType.START,
        position: { x: 250, y: 50 },
        data: { label: 'Start', type: NodeType.START },
      },
      {
        id: '2',
        type: NodeType.HTTP_REQUEST,
        position: { x: 250, y: 150 },
        data: {
          label: 'Health Check',
          type: NodeType.HTTP_REQUEST,
          config: {
            method: 'GET',
            url: 'https://api.example.com/health',
            headers: {},
          },
        },
      },
      {
        id: '3',
        type: NodeType.CONDITION,
        position: { x: 250, y: 280 },
        data: {
          label: 'Is Healthy?',
          type: NodeType.CONDITION,
          config: {
            condition: 'previousOutput.StatusCode === 200',
          },
        },
      },
      {
        id: '4',
        type: NodeType.EMAIL,
        position: { x: 400, y: 410 },
        data: {
          label: 'Send Alert',
          type: NodeType.EMAIL,
          config: {
            to: 'alerts@company.com',
            subject: 'API Health Alert',
            body: 'API is unhealthy!',
          },
        },
      },
      {
        id: '5',
        type: NodeType.END,
        position: { x: 100, y: 410 },
        data: { label: 'End (Healthy)', type: NodeType.END },
      },
      {
        id: '6',
        type: NodeType.END,
        position: { x: 400, y: 540 },
        data: { label: 'End (Alert Sent)', type: NodeType.END },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e3-5', source: '3', target: '5' },
      { id: 'e4-6', source: '4', target: '6' },
    ],
  },
  {
    id: 'api-pipeline',
    name: 'API Processing Pipeline',
    description: 'Multi-step API data processing with delays',
    category: 'Integration',
    icon: '⚙️',
    nodes: [
      {
        id: '1',
        type: NodeType.START,
        position: { x: 250, y: 50 },
        data: { label: 'Start', type: NodeType.START },
      },
      {
        id: '2',
        type: NodeType.HTTP_REQUEST,
        position: { x: 250, y: 150 },
        data: {
          label: 'Fetch Data',
          type: NodeType.HTTP_REQUEST,
          config: {
            method: 'POST',
            url: 'https://api.example.com/process',
            headers: { 'Content-Type': 'application/json' },
            body: '{"action": "start"}',
          },
        },
      },
      {
        id: '3',
        type: NodeType.DELAY,
        position: { x: 250, y: 280 },
        data: {
          label: 'Wait 30s',
          type: NodeType.DELAY,
          config: {
            duration: 30000,
          },
        },
      },
      {
        id: '4',
        type: NodeType.HTTP_REQUEST,
        position: { x: 250, y: 410 },
        data: {
          label: 'Check Status',
          type: NodeType.HTTP_REQUEST,
          config: {
            method: 'GET',
            url: 'https://api.example.com/status',
            headers: {},
          },
        },
      },
      {
        id: '5',
        type: NodeType.TRANSFORM,
        position: { x: 250, y: 540 },
        data: {
          label: 'Extract Result',
          type: NodeType.TRANSFORM,
          config: {
            script: 'return { status: previousOutput.Body.status };',
          },
        },
      },
      {
        id: '6',
        type: NodeType.END,
        position: { x: 250, y: 670 },
        data: { label: 'End', type: NodeType.END },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e5-6', source: '5', target: '6' },
    ],
  },
  {
    id: 'database-report',
    name: 'Database Report Generator',
    description: 'Query database and email formatted results',
    category: 'Reporting',
    icon: '📈',
    nodes: [
      {
        id: '1',
        type: NodeType.START,
        position: { x: 250, y: 50 },
        data: { label: 'Start', type: NodeType.START },
      },
      {
        id: '2',
        type: NodeType.DATABASE,
        position: { x: 250, y: 150 },
        data: {
          label: 'Query Sales Data',
          type: NodeType.DATABASE,
          config: {
            databaseType: 'PostgreSQL',
            connectionString: '',
            query: 'SELECT * FROM sales WHERE date >= NOW() - INTERVAL \'7 days\'',
          },
        },
      },
      {
        id: '3',
        type: NodeType.SCRIPT,
        position: { x: 250, y: 280 },
        data: {
          label: 'Format as HTML',
          type: NodeType.SCRIPT,
          config: {
            code: `var rows = previousOutput.Rows;
var html = "<table><tr><th>Date</th><th>Amount</th></tr>";
// Format each row
return html + "</table>";`,
          },
        },
      },
      {
        id: '4',
        type: NodeType.EMAIL,
        position: { x: 250, y: 410 },
        data: {
          label: 'Email Report',
          type: NodeType.EMAIL,
          config: {
            to: 'management@company.com',
            subject: 'Weekly Sales Report',
            body: '',
            isHtml: true,
          },
        },
      },
      {
        id: '5',
        type: NodeType.END,
        position: { x: 250, y: 540 },
        data: { label: 'End', type: NodeType.END },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
    ],
  },
];

export const getTemplatesByCategory = () => {
  const categories = new Map<string, WorkflowTemplate[]>();

  WORKFLOW_TEMPLATES.forEach(template => {
    if (!categories.has(template.category)) {
      categories.set(template.category, []);
    }
    categories.get(template.category)!.push(template);
  });

  return categories;
};
