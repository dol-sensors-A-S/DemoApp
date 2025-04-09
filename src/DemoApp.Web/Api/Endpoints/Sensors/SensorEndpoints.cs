using DemoApp.Web.Auth;

namespace DemoApp.Web.Api.Endpoints.Sensors;

public static class SensorEndpoints
{
    public static void MapSensorEndpoints(
        this RouteGroupBuilder builder)
    {
        var group = builder.MapGroup("/sensors");

        group.MapPost("/{macAddress}", AddSensorEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);

        group.MapPut("/{macAddress}", UpdateSensorEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);

        group.MapDelete("/{macAddress}/{devEui}", RemoveSensorEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);

        group.MapPut("/{macAddress}/wired", UpdateWiredSensorsEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);
    }
}