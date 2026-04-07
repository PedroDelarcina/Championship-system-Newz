using Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace API.Service
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;


        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private byte[] GetKey()
        {
            var key = _configuration["Jwt:Key"]
                      ?? throw new Exception("Jwt:Key não configurada");

            return Convert.FromBase64String(key);
        }

        private TokenModel GenerateToken(Claim[] claim, CancellationToken cancellationToken = default)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            if (!double.TryParse(_configuration.GetValue<string>("Extra: TokenExpirationTime"),
                    out double tokenExpirationTime)) tokenExpirationTime = 4;

            var key = GetKey();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claim),
                Expires = DateTime.UtcNow.AddHours(tokenExpirationTime),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],

                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return new TokenModel() { GenerateAt = DateTime.UtcNow, Token = tokenHandler.WriteToken(token) };
        }


        private Claim[] GetUserClaim(Usuario usuario, CancellationToken cancellationToken)
        {
            return new Claim[]
            {

                 new Claim(JwtRegisteredClaimNames.Sub, usuario.Id),
                 new Claim(JwtRegisteredClaimNames.Email, usuario.Email ?? string.Empty),
                 new Claim(ClaimTypes.NameIdentifier, usuario.Id),
                 new Claim(ClaimTypes.Name, usuario.NickName ?? usuario.UserName ?? string.Empty),
                 new Claim(ClaimTypes.Role, usuario.IsAdmin ? "Admin" : "User")
            };
        }

        public TokenModel GenerateUserToken(Usuario usuario, CancellationToken cancellationToken)
        {
           return GenerateToken(GetUserClaim(usuario, cancellationToken));
        }
    }
}
