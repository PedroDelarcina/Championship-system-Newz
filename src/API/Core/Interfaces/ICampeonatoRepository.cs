using Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces
{
    public interface ICampeonatoRepository : IRepository<Campeonato>
    {
        Task<IEnumerable<Campeonato>> GetCampeonatosAtivosAsync(CancellationToken cancellationToken);
        Task<Campeonato?> GetCampeonatoInscricoesAsync(int id, CancellationToken cancellationToken);
        Task<IEnumerable<Campeonato>> GetCampeonatosByTipoAsync(string tipo, CancellationToken cancellationToken);
        Task<bool> ExisteCampeonatosAtivosAsync(DateTime dataInicio, DateTime dataFim, int? idIgnorar = null, CancellationToken cancellationToken = default);
    }
}
