using DemoApp.Core.DemoApp;
using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using DemoApp.Web.IntegrationApi;
using DemoApp.Web.Validation;
using dol.IoT.Models.Public.DeviceApi;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.AspNetCore.Http.Results;

namespace DemoApp.Web.Api.Endpoints.Sensors;

public static class AddSensorEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromBody] AddSensorRequest request,
        [FromServices] IValidator<AddSensorRequest> validator,
        [FromServices] IIntegratorApiClient apiClient,
        [FromServices] IDeviceService deviceService)
    {
        macAddress = macAddress.ParseMac();
        request = request with {DevEui = request.DevEui.ParseDevEui()};

        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
            return ValidationProblem(result.ToDictionary());

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return BadRequest($"No claim on device {macAddress}");

        if (device.DeviceType is not DeviceType.IDOL64)
            return BadRequest("Only IDOL64 devices can add sensors");

        var response = await apiClient.AddSensor(macAddress, request);
        return await response.Match(
            err => err.AsResult(),
            _ => Task.FromResult(Ok("Sensor added")));
    }
}

public class AddSensorValidator : AbstractValidator<AddSensorRequest>
{
    public AddSensorValidator()
    {
        RuleFor(x => x.DevEui).ValidateDevEui();
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.SampleRate)
            .Must(x => x is >= 60 and <= 900 && x % 60 == 0)
            .WithMessage("Invalid sample rate, must be between 60 and 900 and divisible by 60");
        RuleFor(x => x.SensorType).IsInEnum();
    }
}