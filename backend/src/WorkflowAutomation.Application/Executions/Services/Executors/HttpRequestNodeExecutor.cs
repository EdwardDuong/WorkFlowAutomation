using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Http;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.Services.Executors;

public class HttpRequestNodeExecutor : INodeExecutor
{
    private readonly IHttpClientFactory _httpClientFactory;

    public HttpRequestNodeExecutor(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default)
    {
        if (node.NodeType != NodeType.HttpRequest)
        {
            throw new InvalidOperationException($"Invalid node type. Expected HttpRequest, got {node.NodeType}");
        }

        var config = node.GetConfiguration<HttpRequestConfig>();
        if (config == null || string.IsNullOrWhiteSpace(config.Url))
        {
            throw new InvalidOperationException("HTTP Request node requires a URL configuration");
        }

        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage
        {
            Method = new HttpMethod(config.Method ?? "GET"),
            RequestUri = new Uri(config.Url)
        };

        // Add headers
        if (config.Headers != null)
        {
            foreach (var header in config.Headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }
        }

        // Add body for POST, PUT, PATCH
        if (!string.IsNullOrWhiteSpace(config.Body) &&
            (request.Method == HttpMethod.Post || request.Method == HttpMethod.Put || request.Method == new HttpMethod("PATCH")))
        {
            request.Content = new StringContent(config.Body, Encoding.UTF8, "application/json");
        }

        var response = await client.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        var result = new
        {
            StatusCode = (int)response.StatusCode,
            IsSuccess = response.IsSuccessStatusCode,
            Headers = response.Headers.ToDictionary(h => h.Key, h => string.Join(", ", h.Value)),
            Body = responseBody
        };

        context["previousOutput"] = result;
        return result;
    }

    private class HttpRequestConfig
    {
        public string? Method { get; set; }
        public string? Url { get; set; }
        public Dictionary<string, string>? Headers { get; set; }
        public string? Body { get; set; }
    }
}
