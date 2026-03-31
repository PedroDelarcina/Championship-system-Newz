using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    public  class Usuario : IdentityUser
    {
        public string NickName { get; set; } = string.Empty;
        public DateTime DataRegistro { get; set; } = DateTime.UtcNow;
        public bool IsAdmin { get; set; } = false;

        public ICollection<Inscricao> Inscricoes { get; set; } = new List<Inscricao>();
    }
}
