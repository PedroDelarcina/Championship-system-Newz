using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.PlayerTimeDto
{
    public class PlayerTimeListDto
    {
        public int TimeId { get; set; }
        public string TimeNome { get; set; } = string.Empty;
        public string UsuarioId { get; set; } = string.Empty;
        public string JogadorNickname { get; set; } = string.Empty;
        public bool IsLider { get; set; }
        public DateTime DataEntrada { get; set; }

    }
}
