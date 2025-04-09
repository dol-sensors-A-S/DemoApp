using Azure.Messaging.ServiceBus;
using DemoApp.Core.Db;
using DemoApp.Core.Db.Models;
using DemoApp.Core.IntegratorApi;
using DemoApp.Core.JsonConfig;
using DemoApp.Core.QueueModels;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BackgroundWorker;

public class DeadLetterConsumer(
    ILogger<DeadLetterConsumer> logger,
    IDbContextFactory<DemoAppDbContext> contextFactory,
    IIntegratorApiClient apiClient)
    : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            var queueInfo = await apiClient.QueueInfo();
            while (queueInfo is null)
            {
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                queueInfo = await apiClient.QueueInfo();
            }

            await using var dataQueueClient = new ServiceBusClient(queueInfo.DataQueueConnection);
            await using var dataDeadLetterQueue = dataQueueClient.CreateReceiver(queueInfo.DataQueueName, new ServiceBusReceiverOptions
            {
                SubQueue = SubQueue.DeadLetter,
                ReceiveMode = ServiceBusReceiveMode.PeekLock,
                PrefetchCount = 100
            });

            await using var statusQueueClient = new ServiceBusClient(queueInfo.StatusQueueConnection);
            await using var statusDeadLetterQueue = statusQueueClient.CreateReceiver(queueInfo.StatusQueueName, new ServiceBusReceiverOptions
            {
                SubQueue = SubQueue.DeadLetter,
                ReceiveMode = ServiceBusReceiveMode.PeekLock,
                PrefetchCount = 100
            });

            try
            {
                await ProcessDeadLetterData(dataDeadLetterQueue, stoppingToken);
                await ProcessDeadLetterStatus(statusDeadLetterQueue, stoppingToken);
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error while trying to process DeadLetter queue data from service bus");
            }

            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }

    private async Task ProcessDeadLetterStatus(
        ServiceBusReceiver statusQueue,
        CancellationToken stoppingToken)
    {
        var messages = await statusQueue.ReceiveMessagesAsync(200, TimeSpan.FromSeconds(2), stoppingToken);

        if (messages.Count > 0)
        {
            await using var demoAppDbContext = await contextFactory.CreateDbContextAsync(stoppingToken);

            foreach (var msg in messages)
            {
                try
                {
                    var status = msg.Body.ToObjectFromJson<StatusMessageBase>(Json.SerializerOptions)!;
                    var content = msg.Body.ToString();

                    demoAppDbContext.StatusMessages.Add(new StatusMessage
                    {
                        Content = content,
                        DeviceId = status.DeviceId,
                        Timestamp = status.Timestamp,
                        TimeUtc = DateTimeOffset.FromUnixTimeSeconds(status.Timestamp),
                        Subject = msg.Subject,
                    });

                    await demoAppDbContext.SaveChangesAsync(stoppingToken);
                    await statusQueue.CompleteMessageAsync(msg, stoppingToken);
                }
                catch (DbUpdateException e)
                {
                    // if msg is already in database, just complete it.if (e.InnerException is PostgresException ex)
                    if (e.InnerException is PostgresException ex)
                    {
                        if (ex.MessageText.StartsWith("duplicate key value violates unique constraint", StringComparison.OrdinalIgnoreCase))
                        {
                            await statusQueue.CompleteMessageAsync(msg, stoppingToken);
                        }
                    }
                }
            }
        }
    }


    private async Task ProcessDeadLetterData(
        ServiceBusReceiver dataDeadLetterQueue,
        CancellationToken stoppingToken)
    {
        await using var demoAppDbContext = await contextFactory.CreateDbContextAsync(stoppingToken);
        var messages = await dataDeadLetterQueue.ReceiveMessagesAsync(200, TimeSpan.FromSeconds(2), stoppingToken);
        foreach (var msg in messages)
        {
            try
            {
                var data = msg.Body.ToObjectFromJson<DataMessage>(Json.SerializerOptions);
                if (data is null)
                {
                    logger.LogWarning("Failed to read data message: {MsgBody}", msg.Body.ToString());
                    await dataDeadLetterQueue.CompleteMessageAsync(msg, stoppingToken);
                    return;
                }

                var dataMessage = Data.FromDataMessage(data);
                demoAppDbContext.DataMessages.Add(dataMessage);

                await demoAppDbContext.SaveChangesAsync(stoppingToken);
                await dataDeadLetterQueue.CompleteMessageAsync(msg, stoppingToken);
            }
            catch (DbUpdateException e)
            {
                // if msg is already in database, just complete it.
                if (e.InnerException is PostgresException ex)
                {
                    if (ex.MessageText.StartsWith("duplicate key value violates unique constraint", StringComparison.OrdinalIgnoreCase))
                    {
                        await dataDeadLetterQueue.CompleteMessageAsync(msg, stoppingToken);
                    }
                }
            }
        }
        logger.LogInformation("Saving {DataCount} dead letter data messages to database", messages.Count);
    }
}