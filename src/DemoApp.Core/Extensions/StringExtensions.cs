namespace DemoApp.Core.Extensions;

public static class StringExtensions
{
    public static string ParseMac(this string value)
    {
        var s = new string(value.Where(c => !char.IsWhiteSpace(c) && !c.Equals(':')).ToArray());
        return s.ToLower();
    }

    public static string ParseDevEui(this string value)
    {
        var s = new string(value.Where(c => !char.IsWhiteSpace(c) && !c.Equals(':')).ToArray());
        return s.ToLower();
    }
}
