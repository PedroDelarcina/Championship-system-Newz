using Core.Entities;
using Core.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces.Repositories
{
    public interface IInscricaoRepository : IRepository<Inscricao>
    {
        Task<IEnumerable<Inscricao>> GetAllWithIncludesAsync(CancellationToken cancellationToken);
        Task<IEnumerable<Inscricao>> GetInscricoesByCampeonatoIdAsync(int campeonatoId, CancellationToken cancellationToken);
        Task<IEnumerable<Inscricao>> GetInscricoesByUsuarioIdAsync(string usuarioId, CancellationToken cancellationToken);
        Task<Inscricao?> GetInscricaoByCampeonatoAndTimeAsync(int campeonatoId, int timeId, CancellationToken cancellationToken);
        Task<bool> TimeInscritoCampeonatoAsync(int campeonatoId, int timeId, CancellationToken cancellationToken);
        Task<IEnumerable<Inscricao>> GetInscricoesAprovadasByCampeonatoIdAsync(int campeonatoId, CancellationToken cancellationToken);
        Task<int> GetTotalInscritoCampeonatoAsync(int campeonatoId, CancellationToken cancellationToken);
        Task<bool> UpdateStatusInscricaoAsync(int inscricaoId, StatusInscricao novoStatus, CancellationToken cancellationToken);
    }
}
