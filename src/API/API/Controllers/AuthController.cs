using API.Service;
using Core.DTOs.Auth;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;
        private readonly TokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            SignInManager<Usuario> signInManager,
            UserManager<Usuario> userManager,
            TokenService tokenService,
            ILogger<AuthController> logger)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _tokenService = tokenService;
            _logger = logger;
        }


        [HttpPost("Registro")]
        [AllowAnonymous]
        public async Task<IActionResult> Registro([FromBody] RegistroDto registroDto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(registroDto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email já cadastrado" });
                }

                var existingUserName = _userManager.Users.Any(u => u.NickName == registroDto.Nickname);
                if (existingUserName)
                {
                    return BadRequest(new { message = "Nickname já cadastrado" });
                }


                var user = new Usuario
                {
                    UserName = registroDto.Email,
                    Email = registroDto.Email,
                    NickName = registroDto.Nickname,
                    DataRegistro = DateTime.UtcNow,
                    IsAdmin = false
                };

                var result = await _userManager.CreateAsync(user, registroDto.Password);

                if (!result.Succeeded)
                {
                    var erros = result.Errors.Select(e => e.Description);
                    return BadRequest(new { message = "Erro ao criar usuário", erros });
                }

               var roleResult =  await _userManager.AddToRoleAsync(user, "User");

                if (!roleResult.Succeeded)
                {
                    var erros = roleResult.Errors.Select(e => e.Description);
                    return BadRequest(new { message = "Erro ao adicionar usuário à role", erros });
                }

                _logger.LogInformation($"Novo usuário registrado: {user.Email}");

                return Ok(new
                {
                    message = "Usuário registrado com sucesso",
                    user = new UsuarioResponseDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        NickName = user.NickName,
                        IsAdmin = user.IsAdmin,
                        DataRegistro = user.DataRegistro
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao registrar usuário");
                return StatusCode(500, new { message = "Ocorreu um erro ao registrar o usuário" });
            }
        }


        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return Unauthorized(new { message = "Email ou senha inválidos" });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

                if (!result.Succeeded)
                {
                    return Unauthorized(new { message = "Senha Inválida" });
                }

                var token = _tokenService.GenerateUserToken(user, cancellationToken);

                _logger.LogInformation($"Usuário logado: {user.Email}");

                return Ok(new TokenResponseDto
                {
                    Token = token.Token,
                    Expiration = token.GenerateAt.AddHours(4),
                    UserId = user.Id,
                    Email = user.Email ?? string.Empty,
                    Nickname = user.NickName,
                    IsAdmin = user.IsAdmin
                });

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
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Usuário não autenticado" });
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Usuário não encontrado" });
                }

                return Ok(new UsuarioResponseDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    NickName = user.NickName,
                    IsAdmin = user.IsAdmin,
                    DataRegistro = user.DataRegistro
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter usuário logado");
                return StatusCode(500, new { message = "Ocorreu um erro ao obter o usuário logado" });
            }
        }
    }
}
