using API.Service;
using Core.DTOs.Auth;
using Core.Entities;
using Core.Interfaces.Services;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Service
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;
        private readonly TokenService _tokenService;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(UserManager<Usuario> userManager,
            SignInManager<Usuario> signInManager,
            TokenService tokenService,
            ILogger<AuthService> logger,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _logger = logger;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<AuthResult<UsuarioResponseDto>> RegistroAsync(RegistroDto registroDto)
        {
            var existingUserEmail = await _userManager.FindByEmailAsync(registroDto.Email);
            if (existingUserEmail != null)
                return AuthResult<UsuarioResponseDto>.FailureResult("Email já registrado.");

            var existingNickName = _userManager.Users.Any(u => u.NickName == registroDto.Nickname);
            if (existingNickName)
                return AuthResult<UsuarioResponseDto>.FailureResult("Nickname já registrado.");

            var user = new Usuario
            {
                UserName = registroDto.Email,
                Email = registroDto.Email,
                Nome = registroDto.Nome,
                NickName = registroDto.Nickname,
                DataRegistro = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, registroDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);

                return AuthResult<UsuarioResponseDto>.FailureResult("Falha ao registrar usuário.", errors);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "User");
            if (!roleResult.Succeeded)
            {
                var errors = roleResult.Errors.Select(e => e.Description);

                return AuthResult<UsuarioResponseDto>.FailureResult("Erro ao adicionar usuário à role.", errors);
            }

            _logger.LogInformation("Novo usuário registrado: {Email}", user.Email);

            return AuthResult<UsuarioResponseDto>.SuccessResult(new UsuarioResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                NickName = user.NickName,
                IsAdmin = true,
                DataRegistro = user.DataRegistro
            }, "Usuário registrado com sucesso.");
        }
        public async Task<AuthResult<TokenResponseDto>> LoginAsync(LoginDto loginDto, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null)
                return AuthResult<TokenResponseDto>.FailureResult("Email ou senha inválidos.");

            var resultPassword = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!resultPassword.Succeeded)
                return AuthResult<TokenResponseDto>.FailureResult("Email ou senha inválidos.");

            var token = _tokenService.GenerateUserToken(user, cancellationToken);

            _logger.LogInformation("Usuário logado: {Email}", user.Email);

            return AuthResult<TokenResponseDto>.SuccessResult(new TokenResponseDto
            {
                Token = token.Token,
                Expiration = DateTime.UtcNow.AddHours(4),
                UserId = user.Id,
                Email = user.Email ?? string.Empty,
                Nickname = user.NickName,
                IsAdmin = user.IsAdmin
            }, "Login bem-sucedido.");

        }
        public async Task<AuthResult<UsuarioResponseDto>> UsuarioLogadoAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return AuthResult<UsuarioResponseDto>.FailureResult("Usuário não autenticado");

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return AuthResult<UsuarioResponseDto>.FailureResult("Usuário não encontrado");

            return AuthResult<UsuarioResponseDto>.SuccessResult(new UsuarioResponseDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                NickName = user.NickName,
                IsAdmin = user.IsAdmin,
                DataRegistro = user.DataRegistro
            }, "Usuário autenticado.");
        }

        public async Task<AuthResult<bool>> ResetarSenhaAsync(ResetPasswordDto resetPasswordDto)
        { 
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null)
                return AuthResult<bool>.FailureResult("Token inválido ou usuário não encontrado.");

            var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);

            if(!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return AuthResult<bool>.FailureResult("Falha ao resetar senha.", errors);
            }

            return AuthResult<bool>.SuccessResult(true, "Senha resetada com sucesso.");
        }

        public async Task<AuthResult<bool>> EsqueciSenhaAsync(ForgotPasswordDto forgotPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if(user == null)
                return AuthResult<bool>.SuccessResult(true, "Se o email existir, enviaremos instruções.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var resetPasswordUrl = _configuration["FrontEnd:ResetPasswordUrl"];

            if(string.IsNullOrEmpty(resetPasswordUrl))
                return AuthResult<bool>.FailureResult("URL de reset de senha não configurada.");

            var resetLink = $"{resetPasswordUrl}?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(token)}";

            var body = $@"
             <h2>Recuperação de senha</h2>
             <p>Recebemos uma solicitação para redefinir sua senha.</p>
             <p>Clique no link abaixo para criar uma nova senha:</p>
             <p><a href=""{resetLink}"">Redefinir senha</a></p>
             <p>Se você não solicitou isso, ignore este email.</p>
            ";

            await _emailService.EnviaEmailAsync(user.Email!, "Recuperação de senha - Infestation Championship", body);

            return AuthResult<bool>.SuccessResult(true, "Email de recuperação enviado.");
        }
    }
}