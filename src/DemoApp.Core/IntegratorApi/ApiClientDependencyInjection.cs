using DemoApp.Core.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace DemoApp.Core.IntegratorApi;

public static class ApiClientDependencyInjection
{
    public static void AddApiClient(
        this IServiceCollection services)
    {
        services.AddTransient<IntegrationApiLoginHandler>();
        services.AddHttpClient<IIntegratorApiClient, IntegratorApiClient>((
            serviceProvider,
            httpClient) =>
        {
            var config = serviceProvider.GetRequiredService<IOptions<Config>>();
            httpClient.BaseAddress = new Uri(config.Value.Api.IntegrationApiBaseUrl);
        }).AddHttpMessageHandler<IntegrationApiLoginHandler>();
    }
}