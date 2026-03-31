using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    public class Time
    {
        public int Id { get; set; } 
        public string Nome { get; set; } = string.Empty;
        public string? Clantag { get; set; } = string.Empty;


        public ICollection<Inscricao> Inscricoes { get; set; } = new List<Inscricao>();
        public ICollection<PlayerTime> Players { get; set; } = new List<PlayerTime>();
    }
}
