using DemoApp.Core.Extensions;
using DemoApp.Web.Data;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.DataMeasurements;

public static class DeviceDataEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromQuery] DateTimeOffset startTime,
        [FromQuery] DateTimeOffset? endTime,
        [FromServices] IDataService dataService,
        [FromServices] IDeviceService deviceService)
    {
        macAddress = macAddress.ParseMac();
        var device = await deviceService.GetDevice(macAddress);
        if (device is null) return Results.NotFound("Device not found");

        var data = await dataService.GetDeviceData(macAddress, startTime, endTime);
        var sensorDataContainers = device.DeviceType == DeviceType.IDOL65
            ? GetCameraData(data)
            : GetSensorData(data);

        var deviceDataContainer = new DeviceDataContainer
        {
            DeviceName = device.Name,
            MacAddress = device.MacAddress,
            SensorData = sensorDataContainers.ToArray()
        };

        return Results.Ok(deviceDataContainer);
    }

    private static SensorDataContainer[] GetCameraData(Core.Db.Models.Data[] data)
    {
        if (data.Length == 0)
            return [];

        var first = data.First();

        SensorData[] sensorData = [
            new SensorData
            {
                Type = first.Type,
                Unit = first.Unit,
                Measurements = data.Select(x => new DataMeasurement
                {
                    Timestamp = x.MeasurementTakenAt,
                    Value = x.Value
                }).ToArray()
            },
            new SensorData
            {
                Type = "Image count 1h",
                Unit = "#",
                Measurements = data.Select(x => new DataMeasurement
                {
                    Timestamp = x.MeasurementTakenAt,
                    Value = x.CountDelta
                }).ToArray()
            },
            new SensorData
            {
                Type = "Image count 24h",
                Unit = "#",
                Measurements = data.Select(x => new DataMeasurement
                {
                    Timestamp = x.MeasurementTakenAt,
                    Value = x.Count
                }).ToArray()
            },
            new SensorData
            {
                Type = "Minimum weight",
                Unit = "kg",
                Measurements = data.Select(x => new DataMeasurement
                {
                    Timestamp = x.MeasurementTakenAt,
                    Value = (decimal) x.MinWeight.GetValueOrDefault(0)
                }).ToArray()
            },
            new SensorData
            {
                Type = "Maximum weight",
                Unit = "kg",
                Measurements = data.Select(x => new DataMeasurement
                {
                    Timestamp = x.MeasurementTakenAt,
                    Value = (decimal) x.MaxWeight.GetValueOrDefault(0)
                }).ToArray()
            },
            new SensorData
            {
                Type = "Standard deviation",
                Unit = "",
                Measurements = data.Select(x => new DataMeasurement
                    {
                        Timestamp = x.MeasurementTakenAt,
                        Value = (decimal)x.Sd.GetValueOrDefault(0)
                    }).ToArray()
            }
        ];

        var sensorDataContainer = new SensorDataContainer
        {
            SensorData = sensorData,
            SensorId = first.SensorId,
            SensorName = first.SensorName
        };

        return [sensorDataContainer];
    }

    private static SensorDataContainer[] GetSensorData(Core.Db.Models.Data[] data)
    {
        var groupBySensorId = data.GroupBy(x => x.SensorId);
        var sensorDataContainers = groupBySensorId.Select(group =>
        {
            var first = group.First();
            var groupByType = group.GroupBy(x => (x.Unit, x.Type));
            return new SensorDataContainer
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
        }).ToArray();
        return sensorDataContainers;
    }
}

public class DeviceDataContainer
{
    public required string MacAddress { get; set; }
    public required string DeviceName { get; set; }
    public required SensorDataContainer[] SensorData { get; set; }
}