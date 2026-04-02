using Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces
{
    public interface ICampeonatoRepository : IRepository<Campeonato>
    {
        Task<IEnumerable<Campeonato>> GetCampeonatosAtivosAsync();
        Task<Campeonato?> GetCampeonatoInscricoesAsync(int id);
        Task<IEnumerable<Campeonato>> GetCampeonatosByTipoAsync(string tipo);
        Task<bool> ExisteCampeonatosAtivosAsync(DateTime dataInicio, DateTime dataFim, int? idIgnorar = null);
    }
}
