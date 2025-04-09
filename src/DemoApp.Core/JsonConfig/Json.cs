using System.Text.Json;

namespace DemoApp.Core.JsonConfig;

public static class Json
{
    public static readonly JsonSerializerOptions SerializerOptions = new() {PropertyNameCaseInsensitive = true };
    public static T Deserialize<T>(string json) => JsonSerializer.Deserialize<T>(json, SerializerOptions)!;
    public static string Serialize<T>(T value) => JsonSerializer.Serialize(value, SerializerOptions)!;
}