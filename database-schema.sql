-- Workflow Automation Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'User' CHECK (role IN ('User', 'Admin')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);

-- Workflow nodes table
CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL CHECK (node_type IN ('HttpRequest', 'Delay', 'Condition', 'Transform')),
    node_id VARCHAR(100) NOT NULL,
    position_x FLOAT,
    position_y FLOAT,
    configuration JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_nodes_node_type ON workflow_nodes(node_type);

-- Workflow edges table
CREATE TABLE workflow_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    edge_id VARCHAR(100) NOT NULL,
    source_node_id VARCHAR(100) NOT NULL,
    target_node_id VARCHAR(100) NOT NULL,
    source_handle VARCHAR(100),
    target_handle VARCHAR(100),
    edge_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_edges_workflow_id ON workflow_edges(workflow_id);

-- Workflow executions table
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Running', 'Completed', 'Failed', 'Cancelled')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    execution_context JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_user_id ON workflow_executions(user_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_executions_created_at ON workflow_executions(created_at DESC);

-- Execution logs table
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_logs_status ON execution_logs(status);

-- Scheduled workflows table (optional feature)
CREATE TABLE scheduled_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    cron_expression VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_workflows_workflow_id ON scheduled_workflows(workflow_id);
CREATE INDEX idx_scheduled_next_run ON scheduled_workflows(next_run_at) WHERE is_active = true;

-- Refresh tokens table for JWT authentication
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
INSERT INTO users (email, password_hash, full_name, role) VALUES
    ('admin@example.com', 'hashed_password_here', 'Admin User', 'Admin'),
    ('user@example.com', 'hashed_password_here', 'Test User', 'User');

-- Views for common queries

-- Active workflows with execution stats
CREATE VIEW v_workflow_stats AS
SELECT
    w.id,
    w.name,
    w.user_id,
    w.is_active,
    COUNT(DISTINCT we.id) as total_executions,
    COUNT(DISTINCT CASE WHEN we.status = 'Completed' THEN we.id END) as successful_executions,
    COUNT(DISTINCT CASE WHEN we.status = 'Failed' THEN we.id END) as failed_executions,
    MAX(we.created_at) as last_execution_at
FROM workflows w
LEFT JOIN workflow_executions we ON w.id = we.workflow_id
GROUP BY w.id, w.name, w.user_id, w.is_active;

-- Recent execution logs with workflow info
CREATE VIEW v_recent_executions AS
SELECT
    we.id,
    we.workflow_id,
    w.name as workflow_name,
    we.user_id,
    u.email as user_email,
    we.status,
    we.started_at,
    we.completed_at,
    we.created_at,
    EXTRACT(EPOCH FROM (we.completed_at - we.started_at)) as duration_seconds
FROM workflow_executions we
JOIN workflows w ON we.workflow_id = w.id
LEFT JOIN users u ON we.user_id = u.id
ORDER BY we.created_at DESC;

-- Comments for documentation
COMMENT ON TABLE users IS 'Application users with role-based access';
COMMENT ON TABLE workflows IS 'Workflow definitions containing nodes and edges';
COMMENT ON TABLE workflow_nodes IS 'Individual nodes in a workflow (steps/actions)';
COMMENT ON TABLE workflow_edges IS 'Connections between workflow nodes';
COMMENT ON TABLE workflow_executions IS 'Execution instances of workflows';
COMMENT ON TABLE execution_logs IS 'Detailed logs for each node execution';
COMMENT ON TABLE scheduled_workflows IS 'Cron-based workflow scheduling';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';
