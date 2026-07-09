using Core.DTOs.PlayerTimeDto;
using Core.DTOs.Time;
using Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Interfaces.Services
{
    public interface ITimeService
    {
        Task<IEnumerable<TimeListDto>> ObterTodosTimesAsync(CancellationToken cancellationToken);
        Task<TimeResponseDto> ObterTimePorIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<TimeResponseDto>> ObterMeusTimesAsync(string usuarioId, CancellationToken cancellationToken);

        Task<AuthResult<int>> CriarTimeAsync(TimeRequestDto timeRequestDto, string usuarioId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> AdicionarPlayerTimeAsync(AddPlayerTimeDto addPlayerTimeDto, string usuarioLogadoId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> RemoverPlayerTimeAsync(int timeId, string playerId, string usuarioLogadoId, CancellationToken cancellationToken);
        Task<AuthResult<bool>> DeletarTimeAsync(int timeId, string usuarioLogadoId, CancellationToken cancellationToken);

    }
}
