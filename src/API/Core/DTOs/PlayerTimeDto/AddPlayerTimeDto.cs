using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Core.DTOs.PlayerTimeDto
{
    public class AddPlayerTimeDto
    {
        [Required(ErrorMessage = "ID do time é obrigatório")]
        public int TimeId { get; set; }

        [Required(ErrorMessage = "ID do jogador é obrigatório")]
        public string UsuarioId { get; set; } = string.Empty;

        public bool IsLider { get; set; } = false;

    }
}
