using DemoApp.Core.DemoApp;
using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Auth;
using DemoApp.Web.Devices;
using DemoApp.Web.IntegrationApi;
using DemoApp.Web.Validation;
using dol.IoT.Models.Public.DeviceApi;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.AspNetCore.Http.Results;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class ClaimDeviceEndpoint
{
    public static async Task<IResult> Handle(
        [FromBody] ClaimRequest req,
        [FromServices] IValidator<ClaimRequest> validator,
        [FromServices] IIntegratorApiClient apiClient,
        [FromServices] IUserService userService,
        [FromServices] IDeviceService deviceService)
    {
        req = req with {MacAddress = req.MacAddress.ParseMac()};

        var result = await validator.ValidateAsync(req);
        if (!result.IsValid)
            return ValidationProblem(result.ToDictionary());

        var deviceExists = await deviceService.DeviceExists(req.MacAddress);
        if (deviceExists)
            return BadRequest("Device already claimed");

        var user = await userService.GetUser();

        var claimDeviceResponse = await apiClient.ClaimDevice(req, user.UserGroupId.ToString()!);

        return await claimDeviceResponse.Match(
            err => err.AsResult(),
            HandleSuccess);

        async Task<IResult> HandleSuccess(
            ClaimDeviceResponse response)
        {
            await deviceService.CreateDevice(req.MacAddress, req.Key, req.DeviceType, req.DeviceName);
            return Ok(response);
        }
    }
}

public class ClaimRequestValidator : AbstractValidator<ClaimRequest>
{
    public ClaimRequestValidator()
    {
        RuleFor(x => x.DeviceType).IsInEnum();
        RuleFor(x => x.MacAddress).ValidateMac();
        RuleFor(x => x.Key).Length(5, 10);
        RuleFor(x => x.DeviceName).Length(3, 64);
    }
}