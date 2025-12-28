using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.Services.Executors;

public class EmailNodeExecutor : INodeExecutor
{
    private readonly ILogger<EmailNodeExecutor> _logger;

    public EmailNodeExecutor(ILogger<EmailNodeExecutor> logger)
    {
        _logger = logger;
    }

    public async Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default)
    {
        if (node.NodeType != NodeType.Email)
        {
            throw new InvalidOperationException($"Invalid node type. Expected Email, got {node.NodeType}");
        }

        var config = node.GetConfiguration<EmailConfig>();
        if (config == null || string.IsNullOrWhiteSpace(config.To))
        {
            throw new InvalidOperationException("Email node requires To address configuration");
        }

        try
        {
            using var client = new SmtpClient(config.SmtpServer ?? "localhost", config.SmtpPort ?? 25);

            if (!string.IsNullOrEmpty(config.SmtpUsername) && !string.IsNullOrEmpty(config.SmtpPassword))
            {
                client.Credentials = new NetworkCredential(config.SmtpUsername, config.SmtpPassword);
                client.EnableSsl = config.UseSsl ?? true;
            }

            var message = new MailMessage
            {
                From = new MailAddress(config.From ?? "noreply@workflowautomation.com"),
                Subject = config.Subject ?? "Workflow Notification",
                Body = config.Body ?? "",
                IsBodyHtml = config.IsHtml ?? false
            };

            foreach (var recipient in config.To.Split(';', StringSplitOptions.RemoveEmptyEntries))
            {
                message.To.Add(recipient.Trim());
            }

            if (!string.IsNullOrEmpty(config.Cc))
            {
                foreach (var cc in config.Cc.Split(';', StringSplitOptions.RemoveEmptyEntries))
                {
                    message.CC.Add(cc.Trim());
                }
            }

            await client.SendMailAsync(message, cancellationToken);

            var result = new
            {
                Success = true,
                To = config.To,
                Subject = config.Subject,
                SentAt = DateTime.UtcNow
            };

            context["previousOutput"] = result;
            _logger.LogInformation("Email sent successfully to {To}", config.To);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email");
            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
    }

    private class EmailConfig
    {
        public string? From { get; set; }
        public string? To { get; set; }
        public string? Cc { get; set; }
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public bool? IsHtml { get; set; }
        public string? SmtpServer { get; set; }
        public int? SmtpPort { get; set; }
        public string? SmtpUsername { get; set; }
        public string? SmtpPassword { get; set; }
        public bool? UseSsl { get; set; }
    }
}
