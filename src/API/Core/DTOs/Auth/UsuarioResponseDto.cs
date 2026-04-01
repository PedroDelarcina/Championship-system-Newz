using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.Auth
{
    public class UsuarioResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NickName { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public DateTime DataRegistro { get; set; }
    }
}
