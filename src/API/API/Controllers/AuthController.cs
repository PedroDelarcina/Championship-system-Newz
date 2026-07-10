using API.Service;
using Core.DTOs.Auth;
using Core.Entities;
using Core.Interfaces.Services;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc; 
using Microsoft.EntityFrameworkCore;
using System.Net.Sockets;
using API.Controllers;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseController
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

            return FromResult(result);
        }



        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto, CancellationToken cancellationToken)
        {         
            var result = await _authService.LoginAsync(loginDto, cancellationToken);

            return FromResult(result);
        }

        [HttpGet("Usuario")]
        [Authorize]
        public async Task<IActionResult> UsuarioLogado()
        {
           var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

           var result = await _authService.UsuarioLogadoAsync(userId ?? string.Empty);

            return FromResult(result);

        }

        [HttpPost("EsqueciSenha")]
        [AllowAnonymous]
        public async Task<IActionResult> EsqueciSenha([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var result = await _authService.EsqueciSenhaAsync(forgotPasswordDto);
            
            return FromResult(result);
        }

        [HttpPost("ResetarSenha")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetarSenha([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var result = await _authService.ResetarSenhaAsync(resetPasswordDto);

            return FromResult(result);
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