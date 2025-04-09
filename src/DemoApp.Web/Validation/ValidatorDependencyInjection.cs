using DemoApp.Core.DemoApp;
using DemoApp.Web.Api.Endpoints.Devices;
using DemoApp.Web.Api.Endpoints.Sensors;
using dol.IoT.Models.Public.DeviceApi;
using FluentValidation;

namespace DemoApp.Web.Validation;

public static class ValidatorDependencyInjection
{
    public static void AddValidators(
        this IServiceCollection services)
    {
        services.AddScoped<IValidator<ClaimRequest>, ClaimRequestValidator>();
        services.AddScoped<IValidator<UpdateDeviceRequest>, UpdateDeviceRequestValidator>();
        services.AddScoped<IValidator<AddSensorRequest>, AddSensorValidator>();
        services.AddScoped<IValidator<UpdateSensorRequest>, UpdateSensorRequestValidator>();
        services.AddScoped<IValidator<UpdateWiredSensorsRequest>, UpdateWiredSensorsRequestValidator>();
    }
}