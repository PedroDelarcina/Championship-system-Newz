using Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces
{
    public interface ITimeRepository : IRepository<Time>
    {
        Task<Time?> GetTimeWithJogadoresAsync(int id);
        Task<IEnumerable<Time>> GetTimeByUsuarioIdAsync(string usuarioId);
        Task<bool> ExisteTimeWithNomeAsync(string nome);
        Task<Time?> GetTimeByNomeAsync(string nome);
        Task<IEnumerable<Time>> GetTimesByCampeonatoIdAsync(int campeonatoId);
    }
}
