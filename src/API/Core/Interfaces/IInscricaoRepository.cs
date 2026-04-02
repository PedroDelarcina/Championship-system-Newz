using Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces
{
    public interface IInscricaoRepository : IRepository<Inscricao>
    {
        Task<IEnumerable<Inscricao>> GetInscricoesByCampeonatoIdAsync(int campeonatoId);
        Task<IEnumerable<Inscricao>> GetInscricoesByUsuarioIdAsync(string usuarioId);
        Task<Inscricao?> GetInscricaoByCampeonatoAndTimeAsync(int campeonatoId, int timeId);
        Task<bool> TimeInscritoCampeonatoAsync(int campeonatoId, int timeId);
        Task<int> TotalInscritoCampeonatoAsync(int campeonatoId);
    }
}
