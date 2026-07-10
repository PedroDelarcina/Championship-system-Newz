using Core.Entities;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController : ControllerBase
    {
        protected string GetUserId()
        {
            return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }

        protected bool IsUserAdmin()
        {
            return User.IsInRole("Admin");
        }

        protected IActionResult FromResult<T>(AuthResult<T> result)
        {
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    message = result.Message,
                    data = result.Data
                });
            }
                return Ok(new
                {
                    message = result.Message,
                    data = result.Data
                });
            
        }
    }
}
