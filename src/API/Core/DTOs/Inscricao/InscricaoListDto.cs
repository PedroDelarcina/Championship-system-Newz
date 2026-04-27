using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DTOs.Inscricao
{
    public class InscricaoListDto
    {
        public int Id { get; set; }
        public DateTime DataInscricao { get; set; }
        public string Status { get; set; } = string.Empty; // "Pendente", "Confirmado", "Eliminado", "Campeão"

        public string CampeonatoNome { get; set; } = string.Empty;
        public DateTime CampeonatoDataInicio { get; set; }
        public string TimeNome { get; set; } = string.Empty;
        public string TimeTag { get; set; } = string.Empty;
        public int TotalJogadores { get; set; }

    }
}
