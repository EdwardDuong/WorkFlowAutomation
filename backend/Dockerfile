# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/WorkflowAutomation.API/WorkflowAutomation.API.csproj", "WorkflowAutomation.API/"]
COPY ["src/WorkflowAutomation.Application/WorkflowAutomation.Application.csproj", "WorkflowAutomation.Application/"]
COPY ["src/WorkflowAutomation.Domain/WorkflowAutomation.Domain.csproj", "WorkflowAutomation.Domain/"]
COPY ["src/WorkflowAutomation.Infrastructure/WorkflowAutomation.Infrastructure.csproj", "WorkflowAutomation.Infrastructure/"]

RUN dotnet restore "WorkflowAutomation.API/WorkflowAutomation.API.csproj"

# Copy the rest of the source code
COPY src/ .

# Build the application
WORKDIR "/src/WorkflowAutomation.API"
RUN dotnet build "WorkflowAutomation.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "WorkflowAutomation.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copy published files
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "WorkflowAutomation.API.dll"]
