using Aspire.Hosting.Azure;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var domain = builder.AddParameter("Auth0Domain");
var clientId = builder.AddParameter("Auth0ClientId");
var audience = builder.AddParameter("Auth0Audience");
var apiUsername = builder.AddParameter("ApiUsername", secret: true);
var apiPassword = builder.AddParameter("ApiPassword", secret: true);
var apiBaseUrl = builder.AddParameter("ApiBaseUrl");

var cache = builder.AddRedis("cache");

var pgServer = builder.AddPostgres("postgres")
    .WithImageTag("16.4-alpine3.20")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithPgWeb()
    .WithDataVolume("demoapp-postgresdata");
    // .WithCommand("Some action", "Gogo action", x => Task.FromResult(new ExecuteCommandResult { Success = true }), iconName: "BookDatabase", iconVariant: IconVariant.Filled);

if (builder.ExecutionContext.IsPublishMode)
{
#pragma warning disable CS0618 // Type or member is obsolete
    pgServer = pgServer.PublishAsAzurePostgresFlexibleServer();
#pragma warning restore CS0618 // Type or member is obsolete
}

var postgresDb = pgServer.AddDatabase("postgresDb", "demoApp");

var api = builder.AddProject<DemoApp_Web>("api")
    .WaitFor(pgServer)
    .WithReference(cache)
    .WithReference(postgresDb)
    .WithEnvironment("Api__Username", apiUsername)
    .WithEnvironment("Api__Password", apiPassword)
    .WithEnvironment("Api__IntegrationApiBaseUrl", apiBaseUrl)
    .WithEnvironment("Auth0__Domain", domain)
    .WithEnvironment("Auth0__Audience", audience);

builder.AddProject<BackgroundWorker>("background-worker")
     .WaitFor(pgServer)
     .WithReference(postgresDb)
     .WithReference(cache)
     .WithEnvironment("Api__Username", apiUsername)
     .WithEnvironment("Api__Password", apiPassword)
     .WithEnvironment("Api__IntegrationApiBaseUrl", apiBaseUrl);

builder.AddNpmApp("frontend", "../frontend")
    .WithEnvironment("REACT_APP_API_BASE_URL", api.GetEndpoint("http"))
    .WithEnvironment("BROWSER", "none") // Disable opening browser on npm start
    .WithEnvironment("REACT_APP_AUTH0_AUDIENCE", audience)
    .WithEnvironment("REACT_APP_AUTH0_CLIENTID", clientId)
    .WithEnvironment("REACT_APP_AUTH0_DOMAIN", domain)
    .WithHttpEndpoint(env: "SERVER_PORT", targetPort: 3000, port: 80)
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();