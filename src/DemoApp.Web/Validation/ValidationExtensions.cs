using System.Text.RegularExpressions;
using FluentValidation;

namespace DemoApp.Web.Validation;

public static partial class ValidationExtensions
{
    public static IRuleBuilderOptions<T, string> ValidateDevEui<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotNull()
            .Matches(DevEuiRegex)
            .WithMessage("Not a valid DevEui. Please use the following format: f2b3d57ed8522304");
    }

    public static IRuleBuilderOptions<T, string> ValidateMac<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder.NotNull().Length(12)
            .Matches(MacRegex)
            .WithMessage("Not a valid mac address. Please use the following (example) format: 0123b12ba922");
    }

    private static readonly Regex MacRegex = MacRegexCompiled();
    private static readonly Regex DevEuiRegex = DevEuiRegexCompiled();

    [GeneratedRegex("([0-9a-f]){12}", RegexOptions.Compiled)]
    private static partial Regex MacRegexCompiled();
    [GeneratedRegex("([0-9a-f]){16}", RegexOptions.Compiled)]
    private static partial Regex DevEuiRegexCompiled();
}