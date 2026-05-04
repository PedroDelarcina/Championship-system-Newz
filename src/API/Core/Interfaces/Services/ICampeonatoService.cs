using Core.DTOs.Campeonato;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces.Services
{
    public interface ICampeonatoService 
    {
        Task<IEnumerable<CampeonatoResponseDto>> ObterTodosCampeonatos(CancellationToken cancellationToken);

        Task<CampeonatoResponseDto?> ObterCampeonatoPorId(int id, CancellationToken cancellationToken);

        Task<IEnumerable<CampeonatoResponseDto>> ObterCampeonatosAtivos(CancellationToken cancellationToken);

        Task<CampeonatoResponseDto> CriarCampeonato(CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken);

        Task<CampeonatoResponseDto?> AtualizarCampeonato(int id, CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken);

        Task<bool> AlternarStatusCampeonato(int id, string adminUserId, CancellationToken cancellationToken);

        Task<bool> DeletarCampeonato(int id, string adminUserId, CancellationToken cancellationToken);
    }
}
