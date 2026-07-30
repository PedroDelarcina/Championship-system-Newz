namespace Core.DTOs.Inscricao
{
    public class InscricaoListDto
    {
        public int Id { get; set; }
        public DateTime DataInscricao { get; set; }
        public string Status { get; set; } = string.Empty;

        public string CampeonatoNome { get; set; } = string.Empty;
        public int CampeonatoId { get; set; }
        public DateTime CampeonatoDataInicio { get; set; }
        public string TimeNome { get; set; } = string.Empty;
        public string TimeTag { get; set; } = string.Empty;
        public int? TimeId { get; set; }
        public string? LogoUrl { get; set; }
        public int TotalJogadores { get; set; }
        public string? UsuarioNickName { get; set; }
        public string? UsuarioId { get; set; }
    }
}
