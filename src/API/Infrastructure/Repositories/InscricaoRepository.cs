using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
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

        public Task<Inscricao?> GetInscricaoByCampeonatoAndTimeAsync(int campeonatoId, int timeId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Inscricao>> GetInscricoesByCampeonatoIdAsync(int campeonatoId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Inscricao>> GetInscricoesByUsuarioIdAsync(string usuarioId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> TimeInscritoCampeonatoAsync(int campeonatoId, int timeId)
        {
            throw new NotImplementedException();
        }

        public Task<int> TotalInscritoCampeonatoAsync(int campeonatoId)
        {
            throw new NotImplementedException();
        }
    }
}
