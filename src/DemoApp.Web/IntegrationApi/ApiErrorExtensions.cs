using DemoApp.Core.IntegratorApi;

namespace DemoApp.Web.IntegrationApi;

public static class ApiErrorExtensions
{
    public static Task<IResult> AsResult(this ApiError apiError) => Task.FromResult(Results.BadRequest(apiError.Message));
}