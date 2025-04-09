using DemoApp.Web.Api.Endpoints;
using DemoApp.Web.Api.Endpoints.DataMeasurements;
using DemoApp.Web.Api.Endpoints.Devices;
using DemoApp.Web.Api.Endpoints.Sensors;
using DemoApp.Web.Auth;

namespace DemoApp.Web.Api;

public static class ApiConfiguration
{
    public static void MapApiEndpoints(
        this WebApplication app,
        string path)
    {
        var group = app.MapGroup(path);

        group.MapGet("/userclaims", UserClaimsOverview.Handle)
            .Require(UserPolicy.Email);

        group.MapDeviceEndpoints();
        group.MapSensorEndpoints();
        group.MapDataEndpoints();
    }
}