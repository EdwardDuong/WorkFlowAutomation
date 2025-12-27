using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowAutomation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStartAndEndNodeTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_refresh_tokens_expiry",
                table: "refresh_tokens");

            migrationBuilder.RenameColumn(
                name: "label",
                table: "workflow_nodes",
                newName: "Label");

            migrationBuilder.AlterColumn<string>(
                name: "Label",
                table: "workflow_nodes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "user_id",
                table: "workflow_executions",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "idx_refresh_tokens_expiry",
                table: "refresh_tokens",
                columns: new[] { "expires_at", "revoked_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_refresh_tokens_expiry",
                table: "refresh_tokens");

            migrationBuilder.RenameColumn(
                name: "Label",
                table: "workflow_nodes",
                newName: "label");

            migrationBuilder.AlterColumn<string>(
                name: "label",
                table: "workflow_nodes",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "user_id",
                table: "workflow_executions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "idx_refresh_tokens_expiry",
                table: "refresh_tokens",
                columns: new[] { "expires_at", "is_revoked" });
        }
    }
}
