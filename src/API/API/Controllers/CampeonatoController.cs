using API.Service;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampeonatoController : ControllerBase
    {
        private readonly TokenService _tokenService;

        public CampeonatoController(TokenService tokenService)
        {
            _tokenService = tokenService;
        }

    }
}
