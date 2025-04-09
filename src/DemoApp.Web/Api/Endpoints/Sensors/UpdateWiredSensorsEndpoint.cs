using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using DemoApp.Web.IntegrationApi;
using dol.IoT.Models.Public.DeviceApi;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Sensors;

public static class UpdateWiredSensorsEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromBody] UpdateWiredSensorsRequest request,
        [FromServices] IValidator<UpdateWiredSensorsRequest> validator,
        [FromServices] IDeviceService deviceService,
        [FromServices] IIntegratorApiClient apiClient)
    {
        macAddress = macAddress.ParseMac();

        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return Results.ValidationProblem(validationResult.ToDictionary());

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return Results.NotFound("Device not found");

        if (device.DeviceType is not DeviceType.IDOL64)
            return Results.BadRequest("Only IDOL64 devices can add wired sensors");

        var response = await apiClient.UpdateWiredSensors(macAddress, request);
        return await response.Match(
            err => err.AsResult(),
            success => Task.FromResult(Results.Ok(success)));
    }
}

public class UpdateWiredSensorsRequestValidator : AbstractValidator<UpdateWiredSensorsRequest>
{
    public UpdateWiredSensorsRequestValidator()
    {
        RuleForEach(x => x.Sensors)
            .Must(x => x.SamplingRate >= 60 && x.SamplingRate <= 900 && x.SamplingRate % 60 == 0)
            .WithMessage("Sampling rate must be between 60 and 900 and divisible by 60")
            .Must(x => x.Port is >= 1 and <= 8);
    }
}