using Core.DTOs.Auth;
using Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthResult<UsuarioResponseDto>> RegistroAsync(RegistroDto registroDto);

        Task<AuthResult<TokenResponseDto>> LoginAsync(LoginDto loginDto, CancellationToken cancellationToken);

        Task<AuthResult<UsuarioResponseDto>> UsuarioLogadoAsync(string userId);

    }
}
