using System.Security.Claims;
using DemoApp.Core.Cache;
using DemoApp.Core.Db;
using DemoApp.Core.Db.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DemoApp.Web.Auth;

public class UserService(IDbContextFactory<DemoAppDbContext> contextFactory, IRedisCache cache,
    ClaimsPrincipal claimsPrincipal, IAuthorizationService authorizationService) : IUserService
{
    public async Task<User> GetUser()
    {
        var userEmail = claimsPrincipal.GetUserEmail();
        var userNameIdentifier = claimsPrincipal.GetUserNameIdentifier();
        if (string.IsNullOrWhiteSpace(userEmail) || string.IsNullOrWhiteSpace(userNameIdentifier))
            throw new UserException("User has no email or id in claims");

        var authResult = await authorizationService.AuthorizeAsync(claimsPrincipal, null, UserPolicy.Email.ToString());
        if (!authResult.Succeeded)
            throw new UserException("User is not authenticated");

        await using var dbContext = await contextFactory.CreateDbContextAsync();

        var user = await GetUser(dbContext, userEmail, userNameIdentifier);

        if (user is not null)
            return user;

        var userGroup = new UserGroup
        {
            Id = Ulid.NewUlid().ToGuid(),
            Name = $"Usergroup {userEmail}",
            Created = DateTimeOffset.UtcNow,
        };
        var newUser = new User
        {
            Id = userNameIdentifier,
            Email = userEmail,
            UserGroup = userGroup
        };

        dbContext.Users.Add(newUser);
        await dbContext.SaveChangesAsync();

        return newUser;
    }

    private async Task<User?> GetUser(
        DemoAppDbContext dbContext,
        string userEmail,
        string userNameIdentifier)
    {
        var user = await cache.Get<User>(userNameIdentifier);

        if (user is not null)
            return user;

        user = await dbContext.Users.Include(x => x.UserGroup).FirstOrDefaultAsync(x => x.Email == userEmail && x.Id == userNameIdentifier);
        if (user is not null)
            await cache.Set(userNameIdentifier, user, TimeSpan.FromMinutes(5));

        return user;
    }
}