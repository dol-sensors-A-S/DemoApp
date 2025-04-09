using BackgroundWorker;
using DemoApp.Core.Cache;
using DemoApp.Core.Configuration;
using DemoApp.Core.Db;
using DemoApp.Core.IntegratorApi;
using Microsoft.EntityFrameworkCore;
using ServiceDefaults;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddHostedService<DbMigrationWorker>();
builder.Services.AddHostedService<QueueConsumer>();
builder.Services.AddHostedService<DeadLetterConsumer>();
builder.Services.AddHostedService<CleanupWorker>();

builder.AddServiceDefaults();

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(DbMigrationWorker.ActivitySourceName));

builder.Services.Configure<Config>(builder.Configuration);
builder.Services.AddApiClient();
builder.AddCache();

builder.Services.AddDbContextPool<DemoAppDbContext>(options =>
     options.UseNpgsql(builder.Configuration.GetConnectionString("postgresDb"), sqlOptions =>
     {
         sqlOptions.MigrationsAssembly("BackgroundWorker");
     }));

builder.Services.AddDbContextFactory<DemoAppDbContext>();

var app = builder.Build();

app.Run();
