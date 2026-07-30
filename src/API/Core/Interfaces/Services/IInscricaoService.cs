using Core.DTOs.Inscricao;
using Core.Entities;
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
        Task<AuthResult<int>> InscreverTimeCampeonatoAsync(InscricaoRequestDto inscricaoRequestDto, string usuarioId, CancellationToken cancellationToken);
        Task<AuthResult<int>> InscreverUsuarioSoloAsync(int campeonatoId, string usuarioId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> CancelarInscricaoAsync(int inscricaoId, string usuarioId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> AprovarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> RejeitarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> EliminarTimeAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> DefinirCampeaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> RemoverInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken);
    }
}
