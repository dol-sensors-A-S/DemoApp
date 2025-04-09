using DemoApp.Core.JsonConfig;
using StackExchange.Redis;

namespace DemoApp.Core.Cache;

public class RedisCache(IConnectionMultiplexer multiplexer) : IRedisCache
{
    public async Task<T?> Get<T>(
        string key) where T : class
    {
        var db = multiplexer.GetDatabase();
        var result = await db.StringGetAsync(key);
        if (result.HasValue)
        {
            return Json.Deserialize<T>(result.ToString());
        }

        return null;
    }

    public async Task Set<T>(
        string key,
        T value) where T : class
    {
        await Set(key, value, TimeSpan.FromSeconds(60));
    }

    public async Task Set<T>(
        string key,
        T value,
        TimeSpan expiry) where T : class
    {
        var db = multiplexer.GetDatabase();
        await db.StringSetAsync(key, Json.Serialize(value), expiry);
    }
}