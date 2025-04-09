using DemoApp.Core.Db;
using Microsoft.EntityFrameworkCore;

namespace BackgroundWorker;

public class CleanupWorker(
    ILogger<CleanupWorker> logger,
    IDbContextFactory<DemoAppDbContext> contextFactory)
    : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        logger.LogInformation("CleanupWorker started {Now}", DateTimeOffset.UtcNow);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTimeOffset.UtcNow;
                var to = now.AddDays(-180);
                var deleteUpTo = to.ToUnixTimeSeconds();
                await using var dbContext = await contextFactory.CreateDbContextAsync(stoppingToken);

                logger.LogInformation("removing data from database older than {OlderThan}", to.ToString("s"));
                var data = await dbContext.DataMessages.Where(x => x.Timestamp < deleteUpTo).ToArrayAsync(cancellationToken: stoppingToken);
                logger.LogInformation("Found {DataMessagesCount} data messages to remove", data.Length);
                dbContext.DataMessages.RemoveRange(data);
                await dbContext.SaveChangesAsync(stoppingToken);

                logger.LogInformation("removing status messages from database older than {OlderThan}", to.ToString("s"));
                var status = await dbContext.StatusMessages.Where(x => x.Timestamp < deleteUpTo).ToArrayAsync(cancellationToken: stoppingToken);
                logger.LogInformation("Found {StatusMessageCount} status messages to remove ", status.Length);
                dbContext.StatusMessages.RemoveRange(status);
                await dbContext.SaveChangesAsync(stoppingToken);
            }
            catch (Exception e)
            {
                logger.LogError(e, "Failed while running cleanup");
            }

            await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
        }

        logger.LogWarning("Closing down cleanupworker");
    }
}