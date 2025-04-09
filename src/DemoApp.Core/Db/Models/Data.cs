using System.ComponentModel.DataAnnotations;
using DemoApp.Core.QueueModels;

namespace DemoApp.Core.Db.Models;

public class Data
{
    [MaxLength(42)] public string Id { get; set; } = "";
    [MaxLength(12)] public string DeviceId { get; set; } = "";
    [MaxLength(32)] public string SensorId { get; set; } = "";
    [MaxLength(64)] public string SensorName { get; set; } = "";
    [MaxLength(32)] public string Type { get; set; } = "";
    [MaxLength(32)] public string Unit { get; set; } = "";
    public decimal Value { get; set; }
    public long Timestamp { get; set; }
    public DateTimeOffset MeasurementTakenAt { get; set; }
    public bool? WithinSpec { get; set; }
    public int? Count { get; set; }
    public double? MinWeight { get; set; }
    public double? MaxWeight { get; set; }
    public long? Timespan { get; set; }
    public double? Sd { get; set; }
    public double? Skewness { get; set; }
    public int? LastCycleCount { get; set; }
    public int? CountDelta { get; set; }

    public static Data FromDataMessage(DataMessage msg)
    {
        return new Data
        {
            Id = msg.id,
            DeviceId = msg.deviceId,
            SensorId = msg.sensorId,
            SensorName = msg.sensorName,
            Type = msg.type,
            Unit = msg.unit,
            Value = msg.value,
            Timestamp = msg.timestamp,
            MeasurementTakenAt = DateTimeOffset.FromUnixTimeSeconds(msg.timestamp),
            WithinSpec = msg.withinSpec,
            Count = msg.count,
            MinWeight = msg.minWeight,
            MaxWeight = msg.maxWeight,
            Sd = msg.sd,
            Skewness = msg.skewness,
            LastCycleCount = msg.lastCycleCount,
            CountDelta = msg.CountDelta,
        };
    }
}