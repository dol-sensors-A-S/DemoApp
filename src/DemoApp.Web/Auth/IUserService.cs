using DemoApp.Core.Db.Models;

namespace DemoApp.Web.Auth;

public interface IUserService
{
    Task<User> GetUser();
}