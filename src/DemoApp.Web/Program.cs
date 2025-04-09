using System.Text.Json.Serialization;
using DemoApp.Core.Cache;
using DemoApp.Core.Configuration;
using DemoApp.Core.Db;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Api;
using DemoApp.Web.Auth;
using DemoApp.Web.Data;
using DemoApp.Web.Devices;
using DemoApp.Web.Validation;
using Microsoft.AspNetCore.Http.Json;
using ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddLogging();
builder.Services.Configure<Config>(builder.Configuration);
builder.Services.AddValidators();
builder.AddCache();

builder.Services.Configure<JsonOptions>(opt =>
{
    opt.SerializerOptions.PropertyNameCaseInsensitive = true;
    opt.SerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
    opt.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDeviceService, DeviceService>();
builder.Services.AddScoped<IDataService, DataService>();
builder.Services.AddScoped<IStatusMessageService, StatusMessageService>();
builder.Services.AddApiClient();

builder.AddNpgsqlDbContext<DemoAppDbContext>("postgresDb");
builder.Services.AddDbContextFactory<DemoAppDbContext>();

builder.SetupAuthentication();

var app = builder.Build();

app.MapDefaultEndpoints();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello dol-sensors demo app");
app.MapApiEndpoints("/api");

app.Run();