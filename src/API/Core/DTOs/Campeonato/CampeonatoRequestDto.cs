using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Core.DTOs.Campeonato
{
    public class CampeonatoRequestDto
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [MinLength(3, ErrorMessage = "Nome deve ter no mínimo 3 caracteres")]
        [MaxLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tipo é obrigatório")]
        public string TipoCampeonato { get; set; } = string.Empty; // "ClanxClan", "Solo", "Dupla", "Trios"

        [Required(ErrorMessage = "Descrição das regras é obrigatória")]
        public string DescricaoRegras { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de início é obrigatória")]
        public DateTime DataInicio { get; set; }

        [Required(ErrorMessage = "Data de fim é obrigatória")]
        public DateTime DataFim { get; set; }
        public string? RegrasExtras { get; set; }
    }
}
