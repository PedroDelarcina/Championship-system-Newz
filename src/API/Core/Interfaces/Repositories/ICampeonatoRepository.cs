using Core.Entities;
using Core.Entities.Enums;

namespace Core.Interfaces.Repositories
{
    public interface ICampeonatoRepository : IRepository<Campeonato>
    {

        Task<IEnumerable<Campeonato>> GetAllWithIncludesAsync(CancellationToken cancellationToken);
        Task<IEnumerable<Campeonato>> GetCampeonatosAtivosAsync(CancellationToken cancellationToken);
        Task<Campeonato?> GetCampeonatoInscricoesAsync(int id, CancellationToken cancellationToken);
        Task<IEnumerable<Campeonato>> GetCampeonatosByTipoAsync(TipoCampeonato tipo, CancellationToken cancellationToken);
        Task<bool> ExisteCampeonatosAtivosAsync(DateTime dataInicio, DateTime dataFim, int? idIgnorar = null, CancellationToken cancellationToken = default);
    }
}
