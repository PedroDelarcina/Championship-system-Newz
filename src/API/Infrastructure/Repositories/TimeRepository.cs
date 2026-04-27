using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    public class TimeRepository : Repository<Time>, ITimeRepository
    {
        private readonly AppDbContext _context;
        public TimeRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> ExisteTimeWithNomeAsync(string nome, CancellationToken cancellationToken)
        {
            return await _dbSet.AnyAsync(n => n.Nome.ToLower() == nome.ToLower(), cancellationToken);
        }

        public async Task<Time?> GetTimeByNomeAsync(string nome, CancellationToken cancellationToken)
        {
            return await _dbSet.FirstOrDefaultAsync(n => n.Nome.ToLower() == nome.ToLower(), cancellationToken);
        }

        public async Task<IEnumerable<Time>> GetTimeByUsuarioIdAsync(string usuarioId, CancellationToken cancellationToken)
        {
            return await _dbSet.Where(j => j.Players.Any(u => u.UsuarioId == usuarioId)).Include(ps => ps.Players).ToListAsync(cancellationToken);
        }

        public async Task<Time?> GetTimeWithJogadoresAsync(int id, CancellationToken cancellationToken)
        {
            return await _dbSet.Include(t => t.Players)
                   .ThenInclude(p => p.Player)
                   .Include(i => i.Inscricoes)
                   .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Time>> GetAllWithPlayersAsync(CancellationToken cancellationToken)
        {
            return await _dbSet
                .Include(t => t.Players)
                    .ThenInclude(p => p.Player)  
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Time>> GetTimesByCampeonatoIdAsync(int campeonatoId, CancellationToken cancellationToken)
        {
            return await _dbSet.Where(t => t.Inscricoes.Any(i => i.CampeonatoId == campeonatoId))
                               .Include(t => t.Players)
                               .ToListAsync(cancellationToken);
        }
    }
}
