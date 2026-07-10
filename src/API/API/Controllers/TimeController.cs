using Core.DTOs.Time;
using Core.Entities;
using Core.DTOs.Auth;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.PlayerTimeDto;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeController : BaseController
    {
        private readonly ITimeService _timeService;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<TimeController> _logger;

        public TimeController(
            ITimeService timeService,
            AppDbContext dbContext,
            ILogger<TimeController> logger)
        {
            _timeService = timeService;
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
            var times = await _timeService.ObterTodosTimesAsync(cancellationToken);

            return Ok(times);
        }

        /// <summary>
        /// Obter time por ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> ObterTimeById(int id, CancellationToken cancellationToken)
        {
            var result = await _timeService.ObterTimePorIdAsync(id, cancellationToken);
            if (result == null)
            {
                return NotFound(new { message = "Time não encontrado" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Buscar times do usuário logado
        /// </summary>
        [HttpGet("meus-times")]
        public async Task<IActionResult> ObterMeusTimes(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            var times = await _timeService.ObterMeusTimesAsync(userId, cancellationToken);
 
            return Ok(times);
        }


        /// <summary>
        /// Criar um novo time
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CriarTime([FromBody] TimeRequestDto timeRequestDto, CancellationToken cancellationToken)
        {
           var userId = GetUserId();

           var result = await _timeService.CriarTimeAsync(timeRequestDto, userId, cancellationToken);
           return FromResult(result);
        }


        /// <summary>
        /// Adicionar jogador ao time (apenas líder)
        ///</summary>
        [HttpPost("adicionar-jogador")]
        public async Task<IActionResult> AdicionarPlayerTime([FromBody] AddPlayerTimeDto addPlayerTimeDto, CancellationToken cancellationToken)
        {

           var userId = GetUserId();

           var result = await _timeService.AdicionarPlayerTimeAsync(addPlayerTimeDto, userId, cancellationToken);
           return FromResult(result);
        }


        /// <summary>
        /// Adicionar jogador ao time (apenas líder)
        /// </summary>
        [HttpDelete("{timeId}/remover-jogador/{playerId}")]
        public async Task<IActionResult> RemoverPlayerTime(int timeId, string playerId, CancellationToken cancellationToken)
        {
           var usuarioLogadoId = GetUserId();

           var result = await _timeService.RemoverPlayerTimeAsync(timeId, playerId, usuarioLogadoId, cancellationToken);              
           return FromResult(result);
        }


        ///<summary>
        /// Deletar time (apenas lider ou admins)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarTime (int id, CancellationToken cancellationToken)
        {
           var usuarioLogadoId = GetUserId();
           var isAdmin = IsUserAdmin();

           var result = await _timeService.DeletarTimeAsync(id, usuarioLogadoId, cancellationToken);                   
           return FromResult(result);
        }
    }
}

        