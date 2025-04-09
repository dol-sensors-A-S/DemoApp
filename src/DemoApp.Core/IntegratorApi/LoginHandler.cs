using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using DemoApp.Core.Cache;
using DemoApp.Core.Configuration;
using DemoApp.Core.JsonConfig;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DemoApp.Core.IntegratorApi;

public class IntegrationApiLoginHandler(IOptions<Config> config, IRedisCache cache) : DelegatingHandler
{
    private const string CacheKey = "api-bearer-token";

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var token = await GetTestAccountToken();
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await base.SendAsync(request, cancellationToken);
    }

    private async Task<string> GetTestAccountToken()
    {
        var loginResponse = await cache.Get<LoginResponse>(CacheKey);
        if (loginResponse is not null)
        {
            if (loginResponse.Expires.AddMinutes(-10) < DateTime.UtcNow)
            {
                loginResponse = await RefreshToken(loginResponse.refreshToken);
                await cache.Set(CacheKey, loginResponse);
                return loginResponse.accessToken;
            }

            return loginResponse.accessToken;
        }

        var resp = await LoginTestAccount();
        await cache.Set(CacheKey, resp);
        return resp.accessToken;
    }

    private async Task<LoginResponse> LoginTestAccount()
    {
        var jsonContent =
            new StringContent(
                Json.Serialize(new {email = config.Value.Api.Username, password = config.Value.Api.Password}),
                new MediaTypeHeaderValue("application/json"));

        var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, $"{config.Value.Api.IntegrationApiBaseUrl}/api/auth/login")
            {Content = jsonContent};

        var response = await base.SendAsync(httpRequestMessage, CancellationToken.None);

        if (response.StatusCode == HttpStatusCode.OK)
        {
            var testLoginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();

            testLoginResponse!.Expires = DateTime.UtcNow.AddSeconds(testLoginResponse.expiresIn);
            return testLoginResponse;
        }

        throw new Exception("Could not authenticate to dol integration api");
    }

    private async Task<LoginResponse> RefreshToken(
        string refreshToken)
    {
        var jsonContent = new StringContent(Json.Serialize(new {refreshToken}),
            new MediaTypeHeaderValue("application/json"));

        var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, $"{config.Value.Api.IntegrationApiBaseUrl}/api/auth/refresh")
            {Content = jsonContent};
        var response = await base.SendAsync(httpRequestMessage, CancellationToken.None);

        if (response.StatusCode == HttpStatusCode.OK)
        {
            var testLoginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();

            testLoginResponse!.Expires = DateTime.UtcNow.AddSeconds(testLoginResponse.expiresIn);
            return testLoginResponse;
        }

        throw new Exception("Could not authenticate to dol integration api");
    }
}

public class LoginResponse
{
    public required string tokenType { get; set; }
    public required string accessToken { get; set; }
    public required int expiresIn { get; set; }
    public required string refreshToken { get; set; }
    public DateTime Expires { get; set; }
}
