using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.Campeonato
{
    public class CampeonatoResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string DescricaoRegras { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public bool IsAtivo { get; set; }
        public string? Campeao { get; set; }
        public string? RegrasExtras { get; set; }
        public int TotalInscricoes { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
