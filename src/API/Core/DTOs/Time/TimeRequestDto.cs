using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Core.DTOs.Time
{
    public class TimeRequestDto
    {
        [Required(ErrorMessage = "Nome do time é obrigatório")]
        [MinLength(3, ErrorMessage = "Nome deve ter no mínimo 3 caracteres")]
        [MaxLength(20, ErrorMessage = "Nome deve ter no máximo 20 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(5, ErrorMessage = "Tag do clã deve ter no máximo 5 caracteres")]
        public string? ClanTag { get; set; }

        public string? LogoUrl { get; set; }

        [Required(ErrorMessage = "Lista de jogadores é obrigatória")]
        [MinLength(1, ErrorMessage = "Time deve ter pelo menos 1 jogador")]
        public List<string> JogadoresIds { get; set; } = new List<string>();

        public string? LiderId { get; set; } 
    }

}

