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
        public TimeRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<bool> ExisteTimeWithNomeAsync(string nome)
        {
            return await _dbSet.AnyAsync(n => n.Nome.ToLower() == nome.ToLower());
        }

        public async Task<Time?> GetTimeByNomeAsync(string nome)
        {
            return await _dbSet.FirstOrDefaultAsync(n => n.Nome.ToLower() == nome.ToLower());
        }

        public async Task<IEnumerable<Time>> GetTimeByUsuarioIdAsync(string usuarioId)
        {
            return await _dbSet.Where(j => j.Players.Any(u => u.UsuarioId == usuarioId)).Include(ps => ps.Players).ToListAsync();
        }

        public async Task<Time?> GetTimeWithJogadoresAsync(int id)
        {
            return await _dbSet.Include(t => t.Players)
                   .ThenInclude(p => p.Player)
                   .Include(i => i.Inscricoes)
                   .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Time>> GetTimesByCampeonatoIdAsync(int campeonatoId)
        {
            return await _dbSet.Where(t => t.Inscricoes.Any(i => i.CampeonatoId == campeonatoId))
                               .Include(t => t.Players)
                               .ToListAsync();
        }
    }
}
