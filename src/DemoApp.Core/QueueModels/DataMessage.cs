// ReSharper disable InconsistentNaming
namespace DemoApp.Core.QueueModels;

public class DataMessage
{
    public string id { get; set; } = "";
    public string deviceId { get; set; } = "";
    public string sensorId { get; set; } = "";
    public string sensorName { get; set; } = "";
    public decimal value { get; set; }
    public string type { get; set; } = "";
    public string unit { get; set; } = "";
    public long timestamp { get; set; }

    public bool? withinSpec { get; set; }
    public int? count { get; set; }
    public double? minWeight { get; set; }
    public double? maxWeight { get; set; }
    public long? timespan { get; set; }
    public double? sd { get; set; }
    public double? skewness { get; set; }
    public int? lastCycleCount { get; set; }
    public int? CountDelta { get; set; }
    public decimal? lastCycleMeanWeight { get; set; }
    public double? lastCycleMinWeight { get; set; }
    public double? lastCycleMaxWeight { get; set; }
    public double? lastCycleStandardDeviation { get; set; }
    public double? lastCycleSkewness { get; set; }
}

