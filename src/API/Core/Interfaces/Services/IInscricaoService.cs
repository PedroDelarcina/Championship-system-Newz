using Core.DTOs.Inscricao;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces.Services
{
    public interface IInscricaoService
    {
        Task<IEnumerable<InscricaoResponseDto>> ObterTodasInscricoes(CancellationToken cancellationToken);
        Task<InscricaoResponseDto?> ObterInscricaoPorId(int id, CancellationToken cancellationToken);
    }
}
