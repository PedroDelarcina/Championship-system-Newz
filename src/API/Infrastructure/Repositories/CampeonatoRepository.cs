using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    public class CampeonatoRepository : Repository<Campeonato>, ICampeonatoRepository
    {

        public CampeonatoRepository(AppDbContext dbContext) : base(dbContext)
        {
            
        }


        public async Task<IEnumerable<Campeonato>> GetAllWithIncludesAsync(CancellationToken cancellationToken)
        {
            return await _dbSet
                .Include(i => i.Inscricoes)
                .OrderByDescending(i => i.DataInicio)
                .ToListAsync(cancellationToken);
        }
        public async Task<IEnumerable<Campeonato>> GetCampeonatosAtivosAsync(CancellationToken cancellationToken)
        {
            return await _dbSet.Include(i => i.Inscricoes).Where(c => c.IsAtivo && c.DataFim > DateTime.UtcNow).OrderBy(c=> c.DataInicio).ToListAsync(cancellationToken);
        }

        public async Task<Campeonato?> GetCampeonatoInscricoesAsync(int id, CancellationToken cancellationToken)
        {
            return await _dbSet.Include(c => c.Inscricoes)
                               .ThenInclude(i => i.Time)
                               .ThenInclude(t => t.Players)
                               .ThenInclude(pt => pt.Player)
                               .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Campeonato>> GetCampeonatosByTipoAsync(string tipo, CancellationToken cancellationToken)
        {
            return await _dbSet.Where(c => c.TipoCampeonato == tipo).OrderByDescending(c=> c.DataInicio).ToListAsync(cancellationToken);
        }

        public async Task<bool> ExisteCampeonatosAtivosAsync(DateTime dataInicio, DateTime dataFim, int? idIgnorar = null, CancellationToken cancellationToken = default)
        {
           var query = _dbSet.Where(c => c.IsAtivo && 
                                        ((c.DataInicio >= dataInicio && c.DataInicio <= dataFim) ||
                                         (c.DataFim >= dataInicio && c.DataFim <= dataFim) ||
                                         (c.DataInicio <= dataInicio && c.DataFim >= dataFim)));
            if (idIgnorar.HasValue)
            {
                query = query.Where(c => c.Id != idIgnorar.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

    }
}
