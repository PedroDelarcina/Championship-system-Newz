using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.Auth
{
    public class TokenResponseDto
    {

        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public string UserId { get; set; } = string.Empty; 
        public string Email { get; set; } = string.Empty;
        public string Nickname { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
    }
}
