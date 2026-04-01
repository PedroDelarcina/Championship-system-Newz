using Core.DTOs.Auth;
using Core.DTOs.Campeonato;
using Core.DTOs.Time;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.Inscricao
{
    public class InscricaoResponseDto
    {

        public int Id { get; set; }
        public DateTime DataInscricao { get; set; }
        public string Status { get; set; } = string.Empty; // "Pendente", "Confirmado", "Eliminado", "Campeao"

        public CampeonatoListDto Campeonato { get; set; } = null!;
        public TimeResponseDto Time { get; set; } = null!;
        public UsuarioResponseDto Usuario { get; set; } = null!; 
    }
}
