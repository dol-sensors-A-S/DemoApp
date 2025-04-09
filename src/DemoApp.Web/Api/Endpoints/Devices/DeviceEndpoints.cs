using DemoApp.Core.Db.Models;
using DemoApp.Web.Auth;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class DeviceEndpoints
{
    public static void MapDeviceEndpoints(
        this RouteGroupBuilder builder)
    {
        var group = builder.MapGroup("/devices");

        group.MapPost("/claim", ClaimDeviceEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);

        group.MapGet("/", ListDevicesEndpoint.Handle)
            .Require(UserPolicy.ReadDevices);

        group.MapGet("/{macAddress}", DeviceInfoEndpoint.Handle)
            .Require(UserPolicy.ReadDevices);

        group.MapPut("/{macAddress}", UpdateDeviceEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);

        group.MapGet("/online", CheckOnlineStatusEndpoint.Handle)
            .Require(UserPolicy.ReadDevices);

        group.MapGet("/{macAddress}/status", DeviceStatusEndpoint.Handle)
            .Require(UserPolicy.ReadDevices);

        group.MapGet("/{macAddress}/calibrationStatus", DeviceCalibrationStatusEndpoint.Handle)
            .Require(UserPolicy.ReadDevices);

        group.MapDelete("/claim/{macAddress}", RemoveDeviceClaimEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);

        group.MapPost("/{macAddress}/calibrate", CalibrateCameraEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);

        group.MapPost("/{macAddress}/image", GetCameraImageEndpoint.Handle)
            .Require(UserPolicy.WriteDevices);
    }
}