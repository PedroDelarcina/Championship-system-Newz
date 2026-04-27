using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    public class Campeonato
    {
        public int Id { get; set; }
        public string Nome  { get; set; } = string.Empty;
        public string TipoCampeonato { get; set; } = string.Empty; // ClansxClans, Solo, Duplas, Times 
        public DateTime DataInicio { get; set; }
        public string DescricaoRegras { get; set; } = string.Empty;
        public string? RegrasExtras { get; set; }
        public DateTime DataFim { get; set; }
        public bool IsAtivo { get; set; } = true;
        public int MaxParticipantes { get; set; }
        public string? Campeao { get; set; }
        public string? Status { get; set; }


        public ICollection<Inscricao> Inscricoes { get; set; } = new List<Inscricao>();
    }
}
