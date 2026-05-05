using Core.DTOs.Inscricao;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces.Services
{
    public interface IInscricaoService
    {
        Task<IEnumerable<InscricaoListDto>> ObterTodasInscricoesAsync(CancellationToken cancellationToken);
      //  Task<InscricaoResponseDto?> ObterInscricaoPorIdAsync(int id, string usuarioLogadoId, CancellationToken cancellationToken);
        Task<IEnumerable<InscricaoListDto>> ObterMinhasInscricoesAsync(string usuarioId, CancellationToken cancellationToken);
        Task<IEnumerable<InscricaoListDto>> ObterInscricoesCampeonatoAsync(int campeonatoId, CancellationToken cancellationToken);
        Task<int> InscreverTimeCampeonatoAsync(InscricaoRequestDto inscricaoRequestDto, string usuarioId, CancellationToken cancellationToken);
        Task<bool> CancelarInscricaoAsync(int inscricaoId, string usuarioId, CancellationToken cancellationToken);
        Task<bool> AprovarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<bool> RejeitarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<bool> EliminarTimeAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<bool> DefinirCampeonatoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<bool> RemoverInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
    }
}
