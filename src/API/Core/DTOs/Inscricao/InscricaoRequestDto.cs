using Core.DTOs.Time;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Core.DTOs.Inscricao
{
    public class InscricaoRequestDto
    {
        [Required(ErrorMessage = "ID do campeonato é obrigatório")]
        public int CampeonatoId { get; set; }

        [Required(ErrorMessage = "Dados do time são obrigatórios")]
        public TimeRequestDto Time { get; set; } = null!;

    }
}
