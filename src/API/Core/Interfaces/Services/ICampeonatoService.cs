using Core.DTOs.Campeonato;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces.Services
{
    public interface ICampeonatoService 
    {
        Task<IEnumerable<CampeonatoResponseDto>> ObterTodosCampeonatos(CancellationToken cancellationToken);

        Task<CampeonatoResponseDto?> ObterCampeonatoPorIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<CampeonatoResponseDto>> ObterCampeonatosAtivosAsync(CancellationToken cancellationToken);

        Task<int> CriarCampeonatoAsync(CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken);

        Task<bool> AtualizarCampeonatoAsync(int id, CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken);

        Task<bool> AlternarStatusCampeonatoAsync(int id, string adminUserId, CancellationToken cancellationToken);

        Task<bool> DeletarCampeonatoAsync(int id, string adminUserId, CancellationToken cancellationToken);
    }
}
