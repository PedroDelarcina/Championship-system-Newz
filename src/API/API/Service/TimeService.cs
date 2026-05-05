using Core.DTOs.Auth;
using Core.DTOs.PlayerTimeDto;
using Core.DTOs.Time;
using Core.Entities;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Service
{
    public class TimeService : ITimeService
    {
        private readonly ILogger _logger;
        private readonly ITimeRepository _timeRepository;
        private readonly AppDbContext _dbContext;

        public TimeService(ILogger<TimeService> logger, ITimeRepository timeRepository, AppDbContext appDbContext)
        {
            _logger = logger;
            _timeRepository = timeRepository;
            _dbContext = appDbContext;
        }

        public async Task<IEnumerable<TimeListDto>> ObterTodosTimesAsync(CancellationToken cancellationToken)
        {
            var times = await _timeRepository.GetAllWithPlayersAsync(cancellationToken);

            return times.Select(t => new TimeListDto
            {
                Id = t.Id,
                Nome = t.Nome,
                ClanTag = t.Clantag,
                LogoUrl = t.LogoUrl,
                DataCriacao = t.DataCriacao,
                TotalJogadores = t.Players.Count,
                LiderNickname = t.Players.FirstOrDefault(pt => pt.isLider)?.Player?.NickName
            });
        }
        public async Task<TimeResponseDto> ObterTimePorIdAsync(int id, CancellationToken cancellationToken)
        {
            var time = await _timeRepository.GetTimeWithJogadoresAsync(id, cancellationToken);
            if (time == null)
                throw new KeyNotFoundException("Time não encontrado.");

            return new TimeResponseDto
            {
                Id = time.Id,
                Nome = time.Nome,
                ClanTag = time.Clantag,
                LogoUrl = time.LogoUrl,
                DataCriacao = time.DataCriacao,
                TotalJogadores = time.Players?.Count ?? 0,
                LiderId = time.Players?.FirstOrDefault(pt => pt.isLider)?.UsuarioId,
                Lider = time.Players?.FirstOrDefault(pt => pt.isLider)?.Player?.NickName,
                Jogadores = time.Players?.Select(pt => new UsuarioResponseDto
                {
                    Id = pt.Player.Id,
                    NickName = pt.Player.NickName,
                    Email = pt.Player.Email ?? string.Empty,
                    IsAdmin = pt.Player.IsAdmin,
                    DataRegistro = pt.Player.DataRegistro
                }).ToList() ?? new List<UsuarioResponseDto>()
            };
        }
        public async Task<IEnumerable<TimeResponseDto>> ObterMeusTimesAsync(string usuarioId, CancellationToken cancellationToken)
        {
           var times = await _timeRepository.GetTimeByUsuarioIdAsync(usuarioId, cancellationToken);

            return times.Select(t => new TimeResponseDto
            {
                Id = t.Id,
                Nome = t.Nome,
                ClanTag = t.Clantag,
                LogoUrl = t.LogoUrl,
                DataCriacao = t.DataCriacao,
                TotalJogadores = t.Players?.Count ?? 0,
                LiderId = t.Players?.FirstOrDefault(pt => pt.isLider)?.UsuarioId,
                Lider = t.Players?.FirstOrDefault(pt => pt.isLider)?.Player?.NickName,
            });
        }
        public async Task<bool> AdicionarPlayerTimeAsync(AddPlayerTimeDto addPlayerTimeDto, string usuarioLogadoId, CancellationToken cancellationToken)
        {
            var time = await _timeRepository.GetTimeWithJogadoresAsync(addPlayerTimeDto.TimeId, cancellationToken);

            if (time == null)
                throw new KeyNotFoundException("Time não encontrado.");

            var isLider = time.Players?.Any(p => p.UsuarioId == usuarioLogadoId && p.isLider) ?? false;

            if (!isLider)
                throw new UnauthorizedAccessException("Apenas o líder do time pode adicionar jogadores.");

            if(time.Players?.Any(p => p.UsuarioId == addPlayerTimeDto.UsuarioId) == true)
                throw new InvalidOperationException("Jogador já pertence a este time.");

            var jogadorOutroTime = await _dbContext.PlayerTimes.AnyAsync(pt => pt.UsuarioId == addPlayerTimeDto.UsuarioId, cancellationToken);
            if (jogadorOutroTime)
                throw new InvalidOperationException("Jogador já pertence a outro time.");

            var player = await _dbContext.Users.FindAsync(addPlayerTimeDto.UsuarioId);
            if (player == null)
                throw new KeyNotFoundException("Jogador não encontrado.");

            var playerTime = new PlayerTime
            {
                TimeId = addPlayerTimeDto.TimeId,
                UsuarioId = addPlayerTimeDto.UsuarioId,
                isLider = false
            };

            await _dbContext.PlayerTimes.AddAsync(playerTime, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation($"Jogador {addPlayerTimeDto.UsuarioId} adicionado ao time {time.Nome} por {usuarioLogadoId}");

            return true;
        }

        public async Task<int> CriarTimeAsync(TimeRequestDto timeRequestDto, string usuarioId, CancellationToken cancellationToken)
        {
            var usuarioTemTime = await _dbContext.PlayerTimes.AnyAsync(pt => pt.UsuarioId == usuarioId, cancellationToken);
            if (usuarioTemTime)
                throw new InvalidOperationException("Usuário já pertence a um time.");

            var timeExistente = await _timeRepository.GetTimeByNomeAsync(timeRequestDto.Nome, cancellationToken);
            if (timeExistente != null)
                throw new InvalidOperationException("Já existe um time com esse nome.");

            var novoTime = new Time
            {
                Nome = timeRequestDto.Nome,
                Clantag = timeRequestDto.ClanTag,
                LogoUrl = timeRequestDto.LogoUrl,
                DataCriacao = DateTime.UtcNow
            };

            var time = await _timeRepository.AddAsync(novoTime, cancellationToken);

            var playerTime = new PlayerTime
            {
                TimeId = time.Id,
                UsuarioId = usuarioId,
                isLider = true
            };

            await _dbContext.PlayerTimes.AddAsync(playerTime, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation($"Time criado com sucesso: {time.Nome} pelo usuário {usuarioId}");

            return time.Id;
        }

        public async Task<bool> DeletarTimeAsync(int timeId, string usuarioLogadoId, CancellationToken cancellationToken)
        {
            var time = await _timeRepository.GetTimeWithJogadoresAsync(timeId, cancellationToken);
            if (time == null)
                throw new KeyNotFoundException("Time não encontrado."); 
            
            var isLider = time.Players?.Any(p => p.UsuarioId == usuarioLogadoId && p.isLider) ?? false;

            var isAdmin = await _dbContext.Users.AnyAsync(u => u.Id == usuarioLogadoId && u.IsAdmin, cancellationToken);

            if (!isLider && !isAdmin)
                throw new UnauthorizedAccessException("Apenas o líder ou administrador pode deleter o time.");

            var temInscricoes = await _dbContext.Inscricoes.AnyAsync(i => i.TimeId == timeId, cancellationToken);

            if (temInscricoes)
                throw new InvalidOperationException("Não é possível deletar um time que possui inscrições em campeonatos. Remova as inscrições primeiro.");

            var playersDoTime = _dbContext.PlayerTimes.Where(pt => pt.TimeId == timeId);
            _dbContext.PlayerTimes.RemoveRange(playersDoTime);

            _dbContext.Times.Remove(time);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation($"Time {time.Nome} deletado por {usuarioLogadoId}");

            return true;
        }

        public async Task<bool> RemoverPlayerTimeAsync(int timeId, string playerId, string usuarioLogadoId, CancellationToken cancellationToken)
        {
            var time = await _timeRepository.GetTimeWithJogadoresAsync(timeId, cancellationToken);
            if (time == null)
                throw new KeyNotFoundException("Time não encontrado");

            var isLider = time.Players?.Any(p => p.UsuarioId == usuarioLogadoId && p.isLider) ?? false;

            if (!isLider)
                throw new UnauthorizedAccessException("Apenas o lider do time pode remover jogadores.");

            var playerTime = time.Players?.FirstOrDefault(p => p.UsuarioId == playerId);
            if (playerId == null)
                throw new InvalidOperationException("Jogador não está neste time.");

            if (playerTime.isLider && time.Players?.Count > 1)
                throw new InvalidOperationException("Não é permitido remover o líder do time enquanto o houver outros jogadores.");

            _dbContext.PlayerTimes.Remove(playerTime);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var playerRestantes = await _dbContext.PlayerTimes.CountAsync(p => p.TimeId == timeId, cancellationToken);
            if (playerRestantes == 0)
            {
                _dbContext.Times.Remove(time);
                await _dbContext.SaveChangesAsync(cancellationToken);
                _logger.LogInformation($"Time {time.Nome} deletado por não conter mais jogadores.");

                return true;
            }

            _logger.LogInformation($"Jogador {playerId} removido do time {time.Nome} por {usuarioLogadoId}");

            return true;
        }
    }
}
