using Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces
{
    public interface ITimeRepository : IRepository<Time>
    {
        Task<Time?> GetTimeWithJogadoresAsync(int id, CancellationToken cancellationToken);
        Task<IEnumerable<Time>> GetTimeByUsuarioIdAsync(string usuarioId, CancellationToken cancellationToken);
        Task<bool> ExisteTimeWithNomeAsync(string nome, CancellationToken cancellationToken);
        Task<Time?> GetTimeByNomeAsync(string nome, CancellationToken cancellationToken);
        Task<IEnumerable<Time>> GetTimesByCampeonatoIdAsync(int campeonatoId, CancellationToken cancellationToken);
    }
}
