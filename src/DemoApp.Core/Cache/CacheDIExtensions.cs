using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace DemoApp.Core.Cache;

public static class CacheDependencyInjection
{
    public static void AddCache(
        this IHostApplicationBuilder builder)
    {
        builder.AddRedisClient("cache");
        builder.Services.AddSingleton<IRedisCache, RedisCache>();
    }
}