using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using DemoApp.Web.IntegrationApi;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class GetCameraImageEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromServices] IDeviceService deviceService,
        [FromServices] IIntegratorApiClient apiClient)
    {
        macAddress = macAddress.ParseMac();
        var device = await deviceService.GetDevice(macAddress);

        if (device is null)
            return Results.NotFound($"You do not have a claim on device with mac {macAddress}");
        if (device.DeviceType != DeviceType.IDOL65)
            return Results.BadRequest("You can only get images from IDOL65 devices");

        var result = await apiClient.GetImage(macAddress);
        return await result.Match(
            err => err.AsResult(),
            async stream =>
            {
                var img = await Image.LoadAsync<Rgba32>(stream);
                img.Mutate(x => x.Brightness(2f));
                await using var ms = new MemoryStream();
                await img.SaveAsPngAsync(ms);

                return Results.File(ms.ToArray(), "image/png", $"{macAddress}_{DateTimeOffset.UtcNow}.png");
            });
    }
}