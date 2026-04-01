using Core.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.Time
{
    public class TimeResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? ClanTag { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime DataCriacao { get; set; }
        public List<UsuarioResponseDto> Jogadores { get; set; } = new List<UsuarioResponseDto>();
        public UsuarioResponseDto? Lider { get; set; }
        public int TotalJogadores { get; set; }

    }
}
