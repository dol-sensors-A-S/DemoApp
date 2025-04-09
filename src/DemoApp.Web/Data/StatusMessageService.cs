using DemoApp.Core.Db;
using DemoApp.Core.Db.Models;
using DemoApp.Core.JsonConfig;
using DemoApp.Web.Data;
using dol.IoT.Models.Public.Messages;
using Microsoft.EntityFrameworkCore;

namespace DemoApp.Web.Data;

public class StatusMessageService(DemoAppDbContext dbContext) : IStatusMessageService
{
    private const string DeviceConnectionChangedLabel = "DeviceConnectionChanged";
    private const string SensorsInactiveLabel = "SensorInactive";
    private const string VisionStatusMessageLabel = "VisionStatusMessage";
    private const string SensorBatteryUpdatesLabel = "SensorBatteryUpdates";

    public async Task<DeviceConnectionChangedResponse[]> GetConnectionStatusMessages(
        string deviceId,
        DateTimeOffset startTime,
        DateTimeOffset? endTime = null)
    {
        var messages = await GetStatusMessagesOfType(deviceId, DeviceConnectionChangedLabel, startTime, endTime);
        return messages.Select(x =>
        {
            var msg = Json.Deserialize<DeviceConnectionChangedResponse>(x.Content);
            msg.TimeUtc = x.TimeUtc;
            return msg;
        }).ToArray();
    }

    public async Task<SensorInactiveResponse?> GetLastSensorsInactiveMessage(
        string deviceId)
    {
        var message = await GetLatestStatusMessageOfType(deviceId, SensorsInactiveLabel);
        if (message == null)
            return null;

        var msg = Json.Deserialize<SensorInactiveResponse>(message.Content);
        msg.TimeUtc = message.TimeUtc;
        return msg;
    }

    public async Task<VisionStatusMessageResponse[]> GetVisionStatusMessages(
        string deviceId,
        DateTimeOffset startTime,
        DateTimeOffset? endTime = null)
    {
        var messages = await GetStatusMessagesOfType(deviceId, VisionStatusMessageLabel, startTime, endTime);
        return messages.Select(x =>
        {
            var msg = Json.Deserialize<VisionStatusMessageResponse>(x.Content);
            msg.TimeUtc = x.TimeUtc;
            return msg;
        }).ToArray();
    }

    public async Task<SensorBatteryResponse[]> GetSensorBatteryMessages(
        string deviceId,
        DateTimeOffset startTime,
        DateTimeOffset? endTime = null)
    {
        var messages = await GetStatusMessagesOfType(deviceId, SensorBatteryUpdatesLabel, startTime, endTime);
        return messages.Select(x =>
        {
            var msg = Json.Deserialize<SensorBatteryResponse>(x.Content);
            msg.TimeUtc = x.TimeUtc;
            return msg;
        }).ToArray();
    }

    private async Task<StatusMessage[]> GetStatusMessagesOfType(
        string deviceId,
        string subject,
        DateTimeOffset startTime,
        DateTimeOffset? endTime)
    {
        var start = startTime.ToUnixTimeSeconds();
        var end = endTime?.ToUnixTimeSeconds();
        var statusMessages = dbContext.StatusMessages
            .AsNoTracking()
            .Where(x => x.DeviceId == deviceId && x.Subject == subject)
            .Where(x => x.Timestamp > start);

        if (end.HasValue)
            statusMessages = statusMessages.Where(x => x.Timestamp < end.Value);

        var messages = await statusMessages.OrderByDescending(x => x.Timestamp).ToArrayAsync();
        return messages;
    }


    private async Task<StatusMessage?> GetLatestStatusMessageOfType(
        string deviceId,
        string subject)
    {
        var message = await dbContext.StatusMessages
            .AsNoTracking()
            .Where(x => x.DeviceId == deviceId && x.Subject == subject)
            .OrderByDescending(x => x.Timestamp)
            .FirstOrDefaultAsync();

        return message;
    }
}

public class SensorBatteryResponse
{
    public required string DeviceId { get; set; }
    public long Timestamp { get; set; }
    public required BatteryUpdate[] BatteryUpdates { get; set; }
    public DateTimeOffset TimeUtc { get; set; }
}

public class VisionStatusMessageResponse
{
    public required string DeviceId { get; set; }
    public required VisionStatus VisionStatus { get; set; }
    public long Timestamp { get; set; }
    public DateTimeOffset TimeUtc { get; set; }
}

public class SensorInactiveResponse
{
    public required string DeviceId { get; set; }
    public InactiveSensor[]? InactiveSensors { get; set; }
    public long Timestamp { get; set; }
    public DateTimeOffset TimeUtc { get; set; }
}

public class DeviceConnectionChangedResponse
{
    public required string DeviceId { get; set; }
    public required string State { get; set; }
    public long Timestamp { get; set; }
    public DateTimeOffset TimeUtc { get; set; }
}