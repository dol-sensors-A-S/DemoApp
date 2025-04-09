using Azure.Messaging.ServiceBus;
using DemoApp.Core.Db;
using DemoApp.Core.Db.Models;
using DemoApp.Core.IntegratorApi;
using DemoApp.Core.JsonConfig;
using DemoApp.Core.QueueModels;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BackgroundWorker;

public class QueueConsumer(
    ILogger<QueueConsumer> logger,
    IDbContextFactory<DemoAppDbContext> contextFactory,
    IIntegratorApiClient apiClient)
    : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        var queueInfo = await apiClient.QueueInfo();
        while (queueInfo is null)
        {
            await Task.Delay(5000, stoppingToken);
            queueInfo = await apiClient.QueueInfo();
        }

        await using var dataQueueClient = new ServiceBusClient(queueInfo.DataQueueConnection, new ServiceBusClientOptions
        {
            TransportType = ServiceBusTransportType.AmqpWebSockets
        });
        await using var dataQueue = dataQueueClient.CreateProcessor(queueInfo.DataQueueName, new ServiceBusProcessorOptions
        {
            ReceiveMode = ServiceBusReceiveMode.PeekLock,
            AutoCompleteMessages = true,
        });

        dataQueue.ProcessMessageAsync += (args) => DataMessageHandler(args, stoppingToken);
        dataQueue.ProcessErrorAsync += DataErrorHandler;

        await using var statusQueueClient = new ServiceBusClient(queueInfo.StatusQueueConnection, new ServiceBusClientOptions
        {
            TransportType = ServiceBusTransportType.AmqpWebSockets
        });
        await using var statusQueue = statusQueueClient.CreateProcessor(queueInfo.StatusQueueName, new ServiceBusProcessorOptions
        {
            ReceiveMode = ServiceBusReceiveMode.PeekLock,
            AutoCompleteMessages = true,
        });

        statusQueue.ProcessMessageAsync += (args) => StatusMessageHandler(args, stoppingToken);
        statusQueue.ProcessErrorAsync += StatusErrorHandler;

        await dataQueue.StartProcessingAsync(stoppingToken);
        await statusQueue.StartProcessingAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }

    private async Task DataMessageHandler(
        ProcessMessageEventArgs args,
        CancellationToken stoppingToken)
    {
        var data = args.Message.Body.ToObjectFromJson<DataMessage>(Json.SerializerOptions);
        if (data is null)
        {
            logger.LogWarning("Failed to read data message: {MsgBody}", args.Message.Body.ToString());
            return;
        }
        
        await using var demoAppDbContext = await contextFactory.CreateDbContextAsync(stoppingToken);
        try
        {
            var dataMessage = Data.FromDataMessage(data);
            demoAppDbContext.DataMessages.Add(dataMessage);

            await demoAppDbContext.SaveChangesAsync(stoppingToken);
            logger.LogInformation("Saving data message to database");
        }
        catch (DbUpdateException e)
        {
            // if msg is already in database, just complete it.if (e.InnerException is PostgresException ex)
            if (e.InnerException is PostgresException ex)
            {
                if (ex.MessageText.StartsWith("duplicate key value violates unique constraint", StringComparison.OrdinalIgnoreCase))
                {
                    logger.LogWarning("Data message already in database, skipping, {Id}", data.id);
                }
                else
                {
                    throw;
                }
            }
        }
    }

    private Task DataErrorHandler(ProcessErrorEventArgs args)
    {
        logger.LogError(args.Exception, "Error while reading from data queue");
        return Task.CompletedTask;
    }

    private async Task StatusMessageHandler(
        ProcessMessageEventArgs args,
        CancellationToken stoppingToken)
    {
        await using var demoAppDbContext = await contextFactory.CreateDbContextAsync(stoppingToken);

        var status = args.Message.Body.ToObjectFromJson<StatusMessageBase>(Json.SerializerOptions)!;
        var content = args.Message.Body.ToString();

        try
        {
            demoAppDbContext.StatusMessages.Add(new StatusMessage
            {
                Content = content,
                DeviceId = status.DeviceId,
                Timestamp = status.Timestamp,
                TimeUtc = DateTimeOffset.FromUnixTimeSeconds(status.Timestamp),
                Subject = args.Message.Subject,
            });

            await demoAppDbContext.SaveChangesAsync(stoppingToken);
            logger.LogInformation("Saving status message to database");
        }
        catch (DbUpdateException e)
        {
            // if msg is already in database, just complete it.if (e.InnerException is PostgresException ex)
            if (e.InnerException is PostgresException ex)
            {
                if (ex.MessageText.StartsWith("duplicate key value violates unique constraint", StringComparison.OrdinalIgnoreCase))
                {
                    logger.LogWarning("Status message already in database, skipping");
                }
                else
                {
                    throw;
                }
            }
        }
    }

    private Task StatusErrorHandler(ProcessErrorEventArgs args)
    {
        logger.LogError(args.Exception, "Error while reading from status queue");
        return Task.CompletedTask;
    }
}