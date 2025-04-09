namespace DemoApp.Core.Configuration;

public class Config
{
    public required Auth0Config Auth0 { get; set; }
    public required ApiConfig Api { get; set; }
}

public class Auth0Config
{
    public required string Domain { get; set; }
    public required string Audience { get; set; }
}

public class ApiConfig
{
    public required string Username { get; set; }
    public required string Password { get; set; }
    public required string IntegrationApiBaseUrl { get; set; }
}