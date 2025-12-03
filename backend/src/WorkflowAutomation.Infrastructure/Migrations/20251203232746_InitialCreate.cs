using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowAutomation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    full_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "workflows",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workflows", x => x.id);
                    table.ForeignKey(
                        name: "FK_workflows_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scheduled_workflows",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cron_expression = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    last_run_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    next_run_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WorkflowId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scheduled_workflows", x => x.id);
                    table.ForeignKey(
                        name: "FK_scheduled_workflows_workflows_WorkflowId1",
                        column: x => x.WorkflowId1,
                        principalTable: "workflows",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_scheduled_workflows_workflows_workflow_id",
                        column: x => x.workflow_id,
                        principalTable: "workflows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "workflow_edges",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    edge_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    source_node_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    target_node_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    source_handle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    target_handle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    edge_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workflow_edges", x => x.id);
                    table.ForeignKey(
                        name: "FK_workflow_edges_workflows_workflow_id",
                        column: x => x.workflow_id,
                        principalTable: "workflows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "workflow_executions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    execution_context = table.Column<string>(type: "jsonb", nullable: false),
                    UserId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workflow_executions", x => x.id);
                    table.ForeignKey(
                        name: "FK_workflow_executions_users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_workflow_executions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_workflow_executions_workflows_workflow_id",
                        column: x => x.workflow_id,
                        principalTable: "workflows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "workflow_nodes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    node_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    node_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    position_x = table.Column<float>(type: "real", nullable: true),
                    position_y = table.Column<float>(type: "real", nullable: true),
                    configuration = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workflow_nodes", x => x.id);
                    table.ForeignKey(
                        name: "FK_workflow_nodes_workflows_workflow_id",
                        column: x => x.workflow_id,
                        principalTable: "workflows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "execution_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    execution_id = table.Column<Guid>(type: "uuid", nullable: false),
                    node_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    node_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    input_data = table.Column<string>(type: "jsonb", nullable: true),
                    output_data = table.Column<string>(type: "jsonb", nullable: true),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_execution_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_execution_logs_workflow_executions_execution_id",
                        column: x => x.execution_id,
                        principalTable: "workflow_executions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_logs_execution_created",
                table: "execution_logs",
                columns: new[] { "execution_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "idx_logs_execution_id",
                table: "execution_logs",
                column: "execution_id");

            migrationBuilder.CreateIndex(
                name: "idx_refresh_tokens_expiry",
                table: "refresh_tokens",
                columns: new[] { "expires_at", "revoked_at" });

            migrationBuilder.CreateIndex(
                name: "idx_refresh_tokens_token",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_UserId1",
                table: "refresh_tokens",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "idx_scheduled_next_run",
                table: "scheduled_workflows",
                columns: new[] { "next_run_at", "is_active" },
                filter: "is_active = true");

            migrationBuilder.CreateIndex(
                name: "idx_scheduled_workflow_id",
                table: "scheduled_workflows",
                column: "workflow_id");

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_workflows_WorkflowId1",
                table: "scheduled_workflows",
                column: "WorkflowId1");

            migrationBuilder.CreateIndex(
                name: "idx_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_workflow_edges_workflow_edge_id",
                table: "workflow_edges",
                columns: new[] { "workflow_id", "edge_id" });

            migrationBuilder.CreateIndex(
                name: "idx_workflow_edges_workflow_id",
                table: "workflow_edges",
                column: "workflow_id");

            migrationBuilder.CreateIndex(
                name: "idx_executions_created_at",
                table: "workflow_executions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "idx_executions_status",
                table: "workflow_executions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "idx_executions_user_id",
                table: "workflow_executions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_executions_workflow_id",
                table: "workflow_executions",
                column: "workflow_id");

            migrationBuilder.CreateIndex(
                name: "IX_workflow_executions_UserId1",
                table: "workflow_executions",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "idx_workflow_nodes_workflow_id",
                table: "workflow_nodes",
                column: "workflow_id");

            migrationBuilder.CreateIndex(
                name: "idx_workflow_nodes_workflow_node_id",
                table: "workflow_nodes",
                columns: new[] { "workflow_id", "node_id" });

            migrationBuilder.CreateIndex(
                name: "idx_workflows_is_active",
                table: "workflows",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "idx_workflows_user_id",
                table: "workflows",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "execution_logs");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "scheduled_workflows");

            migrationBuilder.DropTable(
                name: "workflow_edges");

            migrationBuilder.DropTable(
                name: "workflow_nodes");

            migrationBuilder.DropTable(
                name: "workflow_executions");

            migrationBuilder.DropTable(
                name: "workflows");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
