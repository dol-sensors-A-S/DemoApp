using DemoApp.Core.Extensions;
using DemoApp.Web.Data;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.DataMeasurements;

public static class SensorDataEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromRoute] string devEui,
        [FromQuery] DateTimeOffset startTime,
        [FromQuery] DateTimeOffset? endTime,
        [FromServices] IDataService dataService)
    {
        macAddress = macAddress.ParseMac();
        devEui = devEui.ParseDevEui();

        var data = await dataService.GetSensorData(macAddress, devEui, startTime, endTime);
        if (data.Length == 0)
            return Results.NotFound("No data found");

        var groupByType = data.GroupBy(x => (x.Unit, x.Type));
        var first = data.First();
        var container = new SensorDataContainer
        {
            SensorName = first.SensorName,
            SensorId = first.SensorId,
            SensorData = groupByType.Select(x => new SensorData
            {
                Unit = x.Key.Unit,
                Type = x.Key.Type,
                Measurements = x.Select(d => new DataMeasurement
                {
                    Value = d.Value,
                    Timestamp = d.MeasurementTakenAt
                }).ToArray()
            }).OrderBy(x => x.Type).ToArray()
        };

        return Results.Ok(container);
    }
}

public class SensorDataContainer
{
    public required string SensorName { get; set; }
    public required string SensorId { get; set; }
    public required SensorData[] SensorData { get; set; }
}

public class SensorData
{
    public required string Unit { get; set; }
    public required string Type { get; set; }
    public required DataMeasurement[] Measurements { get; set; }
}

public class DataMeasurement
{
    public decimal? Value { get; set; }
    public required DateTimeOffset Timestamp { get; set; }
}