using Core.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    public class Inscricao
    {
        public int Id { get; set; }
        public DateTime DataInscricao { get; set; } = DateTime.UtcNow;
        public StatusInscricao Status { get; set; } = StatusInscricao.Pendente; 


        public int CampeonatoId { get; set; }
        public int TimeId { get; set; }
        public string UsuarioId { get; set; } = string.Empty;


        public virtual Campeonato Campeonato { get; set; } = null!;
        public virtual Time Time { get; set; } = null!;
        public virtual Usuario Usuario { get; set; } = null!;
    }
}
