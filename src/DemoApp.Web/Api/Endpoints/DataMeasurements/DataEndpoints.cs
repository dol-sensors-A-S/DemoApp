using DemoApp.Web.Auth;

namespace DemoApp.Web.Api.Endpoints.DataMeasurements;

public static class DataEndpoints
{
    public static void MapDataEndpoints(
        this RouteGroupBuilder builder)
    {
        var group = builder.MapGroup("/data");
        group.MapPost("/{macAddress}", DeviceDataEndpoint.Handle)
            .Require(UserPolicy.ReadData);

        group.MapPost("/{macAddress}/{devEui}", SensorDataEndpoint.Handle)
            .Require(UserPolicy.ReadData);

        group.MapPost("/export", ExportDataEndpoint.Handle)
            .Require(UserPolicy.ReadData);

        group.MapPost("/{macAddress}/export", ExportDeviceDataEndpoint.Handle)
            .Require(UserPolicy.ReadData);
        
        group.MapPost("/{macAddress}/{devEui}/export", ExportSensorDataEndpoint.Handle)
            .Require(UserPolicy.ReadData);
    }
}