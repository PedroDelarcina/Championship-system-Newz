using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    public class PlayerTime
    {
        public int TimeId { get; set; }
        public string UsuarioId { get; set; } = string.Empty;
        public bool isLider { get; set; } = false;


        public virtual Time Time { get; set; } = null!;
        public virtual Usuario Player { get; set; } = null!;
    }
}
