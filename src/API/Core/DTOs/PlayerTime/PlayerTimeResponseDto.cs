using Core.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.PlayerTimeDto
{
    public class PlayerTimeResponseDto
    {
        public int TimeId { get; set; }
        public string TimeNome { get; set; } = string.Empty;
        public string UsuarioId { get; set; } = string.Empty;
        public UsuarioResponseDto Jogador { get; set; } = null!;
        public bool IsLider { get; set; }
        public DateTime DataEntrada { get; set; }

    }
}
