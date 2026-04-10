using Core.DTOs.Inscricao;
using Core.DTOs.Auth;
using Core.DTOs.Time;
using Core.DTOs.Campeonato;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.Entities.Enums;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InscricaoController : BaseController
    {

        private readonly IInscricaoRepository _inscricaoRepository;
        private readonly ICampeonatoRepository _campeonatoRepository;
        private readonly ITimeRepository _timeRepository;
        private readonly AppDbContext _appDbContext;
        private readonly ILogger<InscricaoController> _logger;

        public InscricaoController(
            IInscricaoRepository inscricaoRepository,
            ICampeonatoRepository campeonatoRepository,
            ITimeRepository timeRepository,
            AppDbContext appDbContext,
            ILogger<InscricaoController> logger)
        {
            _inscricaoRepository = inscricaoRepository;
            _campeonatoRepository = campeonatoRepository;
            _timeRepository = timeRepository;
            _appDbContext = appDbContext;
            _logger = logger;
        }


        /// <summary>
        /// Listar todas as inscrições (admin)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ObterTodasInscricoes(CancellationToken cancellationToken)
        {
            var inscricoes = await _inscricaoRepository.GetAllAsync(cancellationToken);

            var result = inscricoes.Select(i => new InscricaoListDto
            {
                Id = i.Id,
                DataInscricao = i.DataInscricao,
                Status = i.Status.ToString(),
                CampeonatoNome = i.Campeonato.Nome ?? string.Empty,
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time.Nome ?? string.Empty,
                TimeTag = i.Time.Clantag ?? string.Empty,
                TotalJogadores = i.Time.Players.Count
            });

            return Ok(result);
        }


        //REFATORAR ISSO AQUI INTEIRO
        /// <summary>
        /// Obter inscrição por ID 
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> ObterInscricoesById(int id, CancellationToken cancellation)
        {

            var userId = GetUserId();
            var isAdmin = IsUserAdmin();

            var inscricao = await _inscricaoRepository.GetByIdAsync(id, cancellation);
            if (inscricao == null)
            {
                return NotFound(new { message = "Inscrição não encontrada" });
            }

            if (!isAdmin && inscricao.UsuarioId != userId)
                return Forbid("Você não tem permissão para visualizar esta inscrição");

            var result = new InscricaoResponseDto
            {
                Id = inscricao.Id,
                DataInscricao = inscricao.DataInscricao,
                Status = inscricao.Status.ToString(),
                Campeonato = inscricao.Campeonato != null ? new CampeonatoListDto
                {
                    Id = inscricao.Campeonato.Id,
                    Nome = inscricao.Campeonato.Nome,
                    Tipo = inscricao.Campeonato.TipoCampeonato,
                    DataInicio = inscricao.Campeonato.DataInicio,
                    DataFim = inscricao.Campeonato.DataFim,
                    IsAtivo = inscricao.Campeonato.IsAtivo,
                    TotalInscricoes = inscricao.Campeonato.Inscricoes?.Count ?? 0
                } : null,
                Time = inscricao.Time != null ? new TimeResponseDto
                {
                    Id = inscricao.Time.Id,
                    Nome = inscricao.Time.Nome,
                    ClanTag = inscricao.Time.Clantag,
                    LogoUrl = inscricao.Time.LogoUrl,
                    DataCriacao = inscricao.Time.DataCriacao,
                    TotalJogadores = inscricao.Time.Players?.Count ?? 0
                } : null,
                Usuario = inscricao.Usuario != null ? new UsuarioResponseDto
                {
                    Id = inscricao.Usuario.Id,
                    Email = inscricao.Usuario.Email ?? string.Empty,
                    NickName = inscricao.Usuario.NickName,
                    IsAdmin = inscricao.Usuario.IsAdmin,
                    DataRegistro = inscricao.Usuario.DataRegistro
                } : null
            };

            return Ok(result);
        }

        /// <summary>
        /// Listar inscrições do usuário logado
        /// </summary>
        [HttpGet("minhas-inscricoes")]
        public async Task<IActionResult> ObterMinhasInscricoes(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            var inscricoes = await _inscricaoRepository.GetInscricoesByUsuarioIdAsync(userId, cancellationToken);

            var result = inscricoes.Select(i => new InscricaoListDto
            {
                Id = i.Id,
                DataInscricao = i.DataInscricao,
                Status = i.Status.ToString(),
                CampeonatoNome = i.Campeonato.Nome ?? string.Empty,
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time.Nome ?? string.Empty,
                TimeTag = i.Time.Clantag ?? string.Empty,
                TotalJogadores = i.Time.Players?.Count ?? 0
            });

            return Ok(result);
        }

        /// <summary>
        /// Listar inscrições de um campeonato
        /// </summary>
        [HttpGet("campeonato/{campeonatoId}")]
        public async Task<IActionResult> ObterInscricoesCampeonato(int campeonatoId, CancellationToken cancellationToken)
        {
            var inscricoes = await _inscricaoRepository.GetInscricoesByCampeonatoIdAsync(campeonatoId, cancellationToken);

            var result = inscricoes.Select(i => new InscricaoListDto
            {
                Id = i.Id,
                DataInscricao = i.DataInscricao,
                Status = i.Status.ToString(),
                CampeonatoNome = i.Campeonato.Nome ?? string.Empty,
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time.Nome ?? string.Empty,
                TimeTag = i.Time.Clantag ?? string.Empty,
                TotalJogadores = i.Time.Players?.Count ?? 0
            });

            return Ok(result);
        }

        /// <summary>
        /// Inscrever um time em um campeonato 
        /// </summary>  
        [HttpPost]
        public async Task<IActionResult> InscreverTimeCampeonato([FromBody] InscricaoRequestDto inscricaoRequestDto, CancellationToken cancellationToken)
        {
            try
            {
                var userId = GetUserId();

                var campeonato = await _campeonatoRepository.GetByIdAsync(inscricaoRequestDto.CampeonatoId, cancellationToken);
                if (campeonato == null)
                    return NotFound(new { message = "Campeonato não encontrado" });

                if (!campeonato.IsAtivo)
                    return BadRequest(new { message = "Campeonato não está ativo para inscrições" });

                if (campeonato.DataInicio <= DateTime.UtcNow)
                    return BadRequest(new { message = "Campeonato já iniciou, não é possível se inscrever" });

                var time = await _timeRepository.GetTimeWithJogadoresAsync(inscricaoRequestDto.TimeId, cancellationToken);
                if (time == null)
                    return NotFound(new { message = "Time não encontrado" });

                var isLider = time.Players?.Any(p => p.UsuarioId == userId && p.isLider) ?? false;
                if (!isLider)
                    return Forbid("Apenas o líder do time pode realizar a inscrição");

                var totalInscritos = await _inscricaoRepository.GetTotalInscritoCampeonatoAsync(inscricaoRequestDto.CampeonatoId, cancellationToken);
                if (totalInscritos >= campeonato.MaxParticipantes)
                    return BadRequest(new { message = "Limite de inscrições para este campeonato já foi atingido" });

                var inscricao = new Inscricao
                {
                    CampeonatoId = inscricaoRequestDto.CampeonatoId,
                    TimeId = inscricaoRequestDto.TimeId,
                    UsuarioId = userId,
                    DataInscricao = DateTime.UtcNow,
                    Status = StatusInscricao.Pendente
                };

                var result = await _inscricaoRepository.AddAsync(inscricao, cancellationToken);

                _logger.LogInformation($"Time {time.Nome} inscrito no campeonato {campeonato.Nome} pelo usuário {userId}");

                return Ok(new { message = "Inscrição realizada com sucesso! Aguardando aprovação do admin", InscricaoId = result.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao realizar inscrição");
                return StatusCode(500, new { message = "Ocorreu um erro ao realizar a inscrição" });
            }
        }
    }
}
