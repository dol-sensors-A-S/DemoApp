using DemoApp.Core.DemoApp;
using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using DemoApp.Web.IntegrationApi;
using DemoApp.Web.Validation;
using dol.IoT.Models.Public.DeviceApi;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Sensors;

public static class UpdateSensorEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromBody] UpdateSensorRequest request,
        [FromServices] IValidator<UpdateSensorRequest> validator,
        [FromServices] IDeviceService deviceService,
        [FromServices] IIntegratorApiClient apiClient)
    {
        macAddress = macAddress.ParseMac();
        request = request with {DevEui = request.DevEui.ParseDevEui()};

        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return Results.ValidationProblem(validationResult.ToDictionary());

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return Results.NotFound("Device not found");

        if (device.DeviceType is not DeviceType.IDOL64)
            return Results.BadRequest("Only IDOL64 devices can add sensors");

        var result = await apiClient.UpdateSensor(macAddress, request);
        return await result.Match(
            err => err.AsResult(),
            success => Task.FromResult(Results.Ok(success)));
    }
}


public class UpdateSensorRequestValidator : AbstractValidator<UpdateSensorRequest>
{
    public UpdateSensorRequestValidator()
    {
        RuleFor(x => x.DevEui).ValidateDevEui();
        RuleFor(x => x.SampleRate)
            .Must(x => x is null || x is >= 60 and <= 900 && x % 60 == 0)
            .WithMessage("Sample rate must be empty or between 60 and 900 and divisible with 60");
    }
}