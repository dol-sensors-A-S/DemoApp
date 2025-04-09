using DemoApp.Core.DemoApp;
using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Auth;
using DemoApp.Web.Devices;
using DemoApp.Web.IntegrationApi;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.AspNetCore.Http.Results;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class UpdateDeviceEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromBody] UpdateDeviceRequest req,
        [FromServices] IValidator<UpdateDeviceRequest> validator,
        [FromServices] IIntegratorApiClient apiClient,
        [FromServices] IUserService userService,
        [FromServices] IDeviceService deviceService)
    {
        macAddress = macAddress.ParseMac();

        var result = await validator.ValidateAsync(req);
        if (!result.IsValid)
            return ValidationProblem(result.ToDictionary());

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return BadRequest("No claim on device found");

        var response = await apiClient.UpdateDevice(device.MacAddress, req.DeviceName);
        return await response.Match(
            err => err.AsResult(),
            async _ =>
            {
                device.Name = req.DeviceName;
                await deviceService.UpdateDevice(device);
                return Ok("Updated device");
            });
    }
}

public class UpdateDeviceRequestValidator : AbstractValidator<UpdateDeviceRequest>
{
    public UpdateDeviceRequestValidator()
    {
        RuleFor(x => x.DeviceName).Length(4, 64);
    }
}
