using Core.Entities;
using Core.Interfaces;
using Core.Entities.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    public class InscricaoRepository : Repository<Inscricao>, IInscricaoRepository
    {
        public InscricaoRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Inscricao?> GetInscricaoByCampeonatoAndTimeAsync(int campeonatoId, int timeId, CancellationToken cancellationToken)
        {
            return await _dbSet.FirstOrDefaultAsync(i => i.CampeonatoId == campeonatoId && i.TimeId == timeId, cancellationToken);
        }

        public async Task<IEnumerable<Inscricao>> GetInscricoesByCampeonatoIdAsync(int campeonatoId, CancellationToken cancellationToken)
        {
            return await _dbSet.Include(i => i.Time)
                        .ThenInclude(t => t.Players)
                        .ThenInclude(jt => jt.Player)
                      .Include(i => i.Usuario)
                      .Where(i => i.CampeonatoId == campeonatoId)
                      .OrderBy(i => i.DataInscricao)
                      .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Inscricao>> GetInscricoesAprovadasByCampeonatoIdAsync(int campeonatoId, CancellationToken cancellationToken)
        {
            return await _dbSet.Include(i => i.Time)
                               .Where(i => i.CampeonatoId == campeonatoId && i.Status == StatusInscricao.Confirmado)
                               .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Inscricao>> GetInscricoesByUsuarioIdAsync(string usuarioId, CancellationToken cancellationToken)
        {
            return await _dbSet.Include(i => i.Campeonato)
                        .Include(i => i.Time)
                      .Where(i => i.UsuarioId == usuarioId)
                      .OrderByDescending(i => i.DataInscricao)
                      .ToListAsync(cancellationToken);
        }

        public async Task<bool> TimeInscritoCampeonatoAsync(int campeonatoId, int timeId, CancellationToken cancellationToken)
        {
            return await _dbSet.AnyAsync(i => i.CampeonatoId == campeonatoId && i.TimeId == timeId, cancellationToken);
        }

        public async Task<int> GetTotalInscritoCampeonatoAsync(int campeonatoId, CancellationToken cancellationToken)
        {
            return await _dbSet.CountAsync(i => i.CampeonatoId == campeonatoId, cancellationToken);
        }

        public async Task<bool> UpdateStatusInscricaoAsync(int inscricaoId, StatusInscricao novoStatus, CancellationToken cancellationToken)
        {
            var inscricao = await GetByIdAsync(inscricaoId, cancellationToken);
            if (inscricao == null)
                return false;

            inscricao.Status = novoStatus;
            await UpdateAsync(inscricao, cancellationToken);
            return true;
        }
    }
}
