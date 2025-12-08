# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY WorkflowAutomation.sln ./
COPY src/WorkflowAutomation.Domain/WorkflowAutomation.Domain.csproj src/WorkflowAutomation.Domain/
COPY src/WorkflowAutomation.Application/WorkflowAutomation.Application.csproj src/WorkflowAutomation.Application/
COPY src/WorkflowAutomation.Infrastructure/WorkflowAutomation.Infrastructure.csproj src/WorkflowAutomation.Infrastructure/
COPY src/WorkflowAutomation.API/WorkflowAutomation.API.csproj src/WorkflowAutomation.API/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build the application
WORKDIR /src/src/WorkflowAutomation.API
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copy published files
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Docker

ENTRYPOINT ["dotnet", "WorkflowAutomation.API.dll"]
