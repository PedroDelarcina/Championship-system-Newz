using Core.DTOs.Time;
using Core.Entities;
using Core.DTOs.Auth;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.PlayerTimeDto;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeController : BaseController
    {
        private readonly ITimeRepository _timeRepository;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<TimeController> _logger;

        public TimeController(
            ITimeRepository timeRepository,
            AppDbContext dbContext,
            ILogger<TimeController> logger)
        {
            _timeRepository = timeRepository;
            _dbContext = dbContext;
            _logger = logger;
        }


        /// <summary>
        /// Listar todos os times
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ObterTodosTimes(CancellationToken cancellationToken)
        {
            var times = await _timeRepository.GetAllAsync(cancellationToken);
            var result = times.Select(t => new TimeResponseDto
            {
                Id = t.Id,
                Nome = t.Nome,
                ClanTag = t.Clantag,
                LogoUrl = t.LogoUrl,
                DataCriacao = t.DataCriacao,
                TotalJogadores = t.Players?.Count ?? 0,
                Lider = t.Players?.FirstOrDefault(p => p.isLider)?.Player?.NickName
            });

            return Ok(result);
        }

        /// <summary>
        /// Obter time por ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> ObterTimeById(int id, CancellationToken cancellationToken)
        {
            var time = await _timeRepository.GetTimeWithJogadoresAsync(id, cancellationToken);
            if (time == null)
            {
                return NotFound(new { message = "Time não encontrado" });
            }

            var result = new TimeResponseDto
            {
                Id = time.Id,
                Nome = time.Nome,
                ClanTag = time.Clantag,
                LogoUrl = time.LogoUrl,
                DataCriacao = time.DataCriacao,
                TotalJogadores = time.Players?.Count ?? 0,
                LiderId = time.Players?.FirstOrDefault(p => p.isLider)?.UsuarioId,
                Lider = time.Players?.FirstOrDefault(p => p.isLider)?.Player?.NickName,
                Jogadores = time.Players?.Select(u => new UsuarioResponseDto
                {
                    Id = u.Player.Id,
                    Email = u.Player.Email ?? string.Empty,
                    NickName = u.Player.NickName,
                    IsAdmin = u.Player.IsAdmin,
                    DataRegistro = u.Player.DataRegistro
                }).ToList() ?? new List<UsuarioResponseDto>()
            };

            return Ok(result);
        }

        /// <summary>
        /// Buscar times do usuário logado
        /// </summary>
        [HttpGet("meus-times")]
        public async Task<IActionResult> ObterMeusTimes(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            var times = await _timeRepository.GetTimeByUsuarioIdAsync(userId, cancellationToken);

            var result = times.Select(t => new TimeResponseDto
            {
                Id = t.Id,
                Nome = t.Nome,
                ClanTag = t.Clantag,
                LogoUrl = t.LogoUrl,
                DataCriacao = t.DataCriacao,
                TotalJogadores = t.Players?.Count ?? 0,
                Lider = t.Players?.FirstOrDefault(p => p.isLider)?.Player?.NickName
            });
            return Ok(result);
        }


        /// <summary>
        /// Criar um novo time
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CriarTime([FromBody] TimeRequestDto timeRequestDto, CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserId();

                if (await _timeRepository.GetTimeByNomeAsync(timeRequestDto.Nome, cancellationToken) != null)
                {
                    return BadRequest(new { message = "Já existe um time com esse nome" });
                }

                var time = new Time
                {
                    Nome = timeRequestDto.Nome,
                    Clantag = timeRequestDto.ClanTag,
                    LogoUrl = timeRequestDto.LogoUrl,
                    DataCriacao = DateTime.UtcNow
                };

                var novoTime = await _timeRepository.AddAsync(time, cancellationToken);

                var playerTime = new PlayerTime
                {
                    TimeId = novoTime.Id,
                    UsuarioId = userId,
                    isLider = true
                };

                await _dbContext.PlayerTimes.AddAsync(playerTime, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);

                _logger.LogInformation($"Time criado: {novoTime.Nome} pelo usuário {userId}");

                return Ok(new { message = "Time criado com sucesso", TimeId = novoTime.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar time");
                return StatusCode(500, new { message = "Erro interno ao processar a solicitação" });
            }
        }


        /// <summary>
        /// Adicionar jogador ao time (apenas líder)
        ///</summary>
        [HttpPost("{timeId}/adicionar-jogador")]
        public async Task<IActionResult> AdicionarPlayerTime(int timeId, [FromBody] AddPlayerTimeDto addPlayerTimeDto, CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserId();

                var time = await _timeRepository.GetTimeWithJogadoresAsync(timeId, cancellationToken);
                if (time == null)
                {
                    return NotFound(new { message = "Time não encontrado" });
                }

                var isLider = time.Players?.Any(p => p.UsuarioId == userId && p.isLider) ?? false;
                if (!isLider)
                    return Forbid("Apenas o líder do time pode adicionar jogadores");

                if (time.Players?.Any(p => p.UsuarioId == addPlayerTimeDto.UsuarioId) == true)
                    return BadRequest(new { message = "Jogador já faz parte do time" });

                var player = await _dbContext.Users.FindAsync(addPlayerTimeDto.UsuarioId);
                if (player == null)
                    return NotFound(new { message = "Jogador não encontrado" });

                var playerTime = new PlayerTime
                {
                    TimeId = timeId,
                    UsuarioId = addPlayerTimeDto.UsuarioId,
                    isLider = addPlayerTimeDto.IsLider
                };

                await _dbContext.PlayerTimes.AddAsync(playerTime, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);

                _logger.LogInformation($"Player {addPlayerTimeDto.UsuarioId} adicionado ao time {timeId}");

                return Ok(new { message = "Jogador adicionado ao time com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao adicionar jogador ao time");
                return StatusCode(500, new { message = "Erro interno ao processar a solicitação" });
            }
        }


        /// <summary>
        /// Adicionar jogador ao time (apenas líder)
        ///</summary>
        [HttpDelete("{timeId}/remover-jogador/{usuarioId}")]
        public async Task<IActionResult> RemoverPlayerTime(int timeId, string usuarioId, CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserId();

                var time = await _timeRepository.GetTimeWithJogadoresAsync(timeId, cancellationToken);
                if (time == null)
                {
                    return NotFound(new { message = "Time não encontrado" });
                }


                var isLider = time.Players?.Any(p => p.UsuarioId == userId && p.isLider) ?? false;
                if (!isLider)
                    return Forbid("Apenas o líder do time pode remover jogadores");

                var playerTime = time.Players?.FirstOrDefault(p => p.UsuarioId == usuarioId);
                if (playerTime == null)
                    return NotFound(new { message = "Jogador não encontrado no time" });

                if (playerTime.isLider && time.Players?.Count > 1)
                    return BadRequest(new { message = "Não é permitido remover o líder do time enquanto houver outros jogadores" });

                _dbContext.PlayerTimes.Remove(playerTime);
                await _dbContext.SaveChangesAsync(cancellationToken);

                var playersRestantes = await _dbContext.PlayerTimes.CountAsync(pt => pt.TimeId == timeId);

                if (playersRestantes == 0)
                {
                    _dbContext.Times.Remove(time);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation($"Time {time.Nome} deletado por não conter mais jogadores");

                    return Ok(new { message = "Jogador removido e time deletado por não conter mais jogadores" });
                }

                _logger.LogInformation($"Player {usuarioId} removido do time {time.Nome}");

                return Ok(new { message = "Jogador removido com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover jogador do time");
                return StatusCode(500, new { message = "Erro interno ao processar a solicitação" });


            }
        }
    }
}

        