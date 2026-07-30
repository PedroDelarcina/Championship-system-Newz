using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Inscricao
{
    public class InscricaoRequestDto
    {
        [Required(ErrorMessage = "ID do campeonato é obrigatório")]
        public int CampeonatoId { get; set; }

        public int? TimeId { get; set; }
    }
}
