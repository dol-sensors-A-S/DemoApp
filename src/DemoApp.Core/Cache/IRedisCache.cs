namespace DemoApp.Core.Cache;

public interface IRedisCache
{
    Task<T?> Get<T>(
        string key) where T : class;

    Task Set<T>(
        string key,
        T value) where T : class;

    Task Set<T>(
        string key,
        T value,
        TimeSpan expiry) where T : class;
}