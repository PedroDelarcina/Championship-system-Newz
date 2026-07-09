using API.Service;
using Core.DTOs.Auth;
using Core.Entities;
using Core.Interfaces.Services;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly AppDbContext _dbContext;
        private readonly IEmailService _emailService;

        public AuthController(
            SignInManager<Usuario> signInManager,
            UserManager<Usuario> userManager,
            IAuthService authService,
            TokenService tokenService,
            ILogger<AuthController> logger,
            AppDbContext dbContext,
            IEmailService emailService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _tokenService = tokenService;
            _authService = authService;
            _logger = logger;
            _dbContext = dbContext;
            _emailService = emailService;
        }



        [HttpPost("Registro")]
        [AllowAnonymous]
        public async Task<IActionResult> Registro([FromBody] RegistroDto registroDto)
        {
            var result = await _authService.RegistroAsync(registroDto);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                   message = result.Message,
                   errors = result.Errors
                });
            }

            return Ok(new
            {
                message = result.Message,
                data = result.Data
            });
        }



        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _authService.LoginAsync(loginDto, cancellationToken);
                if (!result.Success)
                {
                    return Unauthorized(new { message = result.Message });
                }

                return Ok(result.Data);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao realizar login");
                return StatusCode(500, new { message = "Ocorreu um erro ao realizar login" });
            }
        }

        [HttpGet("Usuario")]
        [Authorize]
        public async Task<IActionResult> UsuarioLogado()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                var result = await _authService.UsuarioLogadoAsync(userId ?? string.Empty);

                if (!result.Success)
                {
                    if (result.Message == "Usuário não autenticado")
                        return Unauthorized(new { message = result.Message });

                    return NotFound(new { message = result.Message });
                }

                return Ok(result.Data);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter usuário logado");
                return StatusCode(500, new { message = "Ocorreu um erro ao obter o usuário logado" });
            }
        }

        [HttpPost("EsqueciSenha")]
        [AllowAnonymous]
        public async Task<IActionResult> EsqueciSenha([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var result = await _authService.EsqueciSenhaAsync(forgotPasswordDto);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        [HttpPost("ResetarSenha")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetarSenha([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var result = await _authService.ResetarSenhaAsync(resetPasswordDto);

            if(!result.Success)
                return BadRequest(new { message = result.Message, errors = result.Errors });

            return Ok(new { message = result.Message });
        }

        [AllowAnonymous]
        [Obsolete]
        [HttpGet("migrate")]
        public async Task<IActionResult> MigrateDatabase()
        {
            _dbContext.Database.Migrate();
            return Ok("Migração concluída com sucesso");
        }
    }
}