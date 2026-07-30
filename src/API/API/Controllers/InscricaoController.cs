using Core.DTOs.Inscricao;
using Core.DTOs.Auth;
using Core.DTOs.Time;
using Core.DTOs.Campeonato;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.Entities.Enums;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InscricaoController : BaseController
    {

        private readonly IInscricaoService _inscricaoService;
        private readonly ICampeonatoService _campeonatoService;
        private readonly ITimeService _timeService;
        private readonly AppDbContext _appDbContext;
        private readonly ILogger<InscricaoController> _logger;

        public InscricaoController(
            IInscricaoService inscricaoService,
            ICampeonatoService campeonatoService,
            ITimeService timeService,
            AppDbContext appDbContext,
            ILogger<InscricaoController> logger)
        {
            _inscricaoService = inscricaoService;
            _campeonatoService = campeonatoService;
            _timeService = timeService;
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
            var result = await _inscricaoService.ObterTodasInscricoesAsync(cancellationToken);

            return Ok(result);
        }


        //REFATORAR ISSO AQUI INTEIRO
        /// <summary>
        /// Obter inscrição por ID 
        /// </summary>
     /*   [HttpGet("{id}")]
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
        } */

        /// <summary>
        /// Listar inscrições do usuário logado
        /// </summary>
        [HttpGet("minhas-inscricoes")]
        public async Task<IActionResult> ObterMinhasInscricoes(CancellationToken cancellationToken)
        {
            var usuarioId = GetUserId();
            var inscricoes = await _inscricaoService.ObterMinhasInscricoesAsync(usuarioId, cancellationToken);

            return Ok(inscricoes);
        }

        /// <summary>
        /// Listar inscrições de um campeonato
        /// </summary>
        [HttpGet("campeonato/{campeonatoId}")]
        [AllowAnonymous]
        public async Task<IActionResult> ObterInscricoesCampeonato(int campeonatoId, CancellationToken cancellationToken)
        {
            var result = await _inscricaoService.ObterInscricoesCampeonatoAsync(campeonatoId, cancellationToken);

            return Ok(result);
        }

        /// <summary>
        /// Inscrever um time em um campeonato 
        /// </summary>  
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InscreverTimeCampeonato([FromBody] InscricaoRequestDto inscricaoRequestDto, CancellationToken cancellationToken)
        {
            var usuarioId = GetUserId();

            var result = await _inscricaoService.InscreverTimeCampeonatoAsync(inscricaoRequestDto, usuarioId, cancellationToken);
            return FromResult(result);
        }

        /// <summary>
        /// Inscrever usuário individualmente em um campeonato Solo
        /// </summary>
        [HttpPost("solo/{campeonatoId}")]
        [Authorize]
        public async Task<IActionResult> InscreverSolo(int campeonatoId, CancellationToken cancellationToken)
        {
            var usuarioId = GetUserId();

            var result = await _inscricaoService.InscreverUsuarioSoloAsync(campeonatoId, usuarioId, cancellationToken);
            return FromResult(result);
        }

        /// <summary>
        /// Cancelar a inscrição de um campeonato (apenas o líder do time ou admin podem cancelar) 
        /// </summary>
        [HttpDelete("{inscricaoId}/cancelarInscricao")]
        public async Task<IActionResult> CancelarInscricao(int inscricaoId, CancellationToken cancellationToken)
        {

            var userId = GetUserId();
            var isAdmin = IsUserAdmin();

            var result = await _inscricaoService.CancelarInscricaoAsync(inscricaoId, userId, cancellationToken);
            return FromResult(result);
        }

        /// <summary>
        /// Aprovar inscrição (apenas admin)
        /// </summary>
        [HttpPost("{inscricaoId}/aprovar")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AprovarInscricao(int inscricaoId, CancellationToken cancellationToken)
        {

            var adminUserId = GetUserId();

            var result = await _inscricaoService.AprovarInscricaoAsync(inscricaoId, adminUserId, cancellationToken);
            return FromResult(result);
        }


        /// <summary>
        /// Rejeitar inscrição (apenas admin)
        /// </summary>
        [HttpPost("{inscricaoId}/rejeitar")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejeitarInscricao(int inscricaoId, CancellationToken cancellationToken)
        {
            var adminUserId = GetUserId();

            var result = await _inscricaoService.RejeitarInscricaoAsync(inscricaoId, adminUserId, cancellationToken);
            return FromResult(result);
        }


        /// <summary>
        /// Eliminar time do campeonato (apenas admin)
        /// </summary>
        [HttpPost("{inscricaoId}/eliminar")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EliminarTime(int inscricaoId, CancellationToken cancellationToken)
        {

            var adminUserId = GetUserId();

            var result = await _inscricaoService.EliminarTimeAsync(inscricaoId, adminUserId, cancellationToken);
            return FromResult(result);
        }

        /// <summary>
        /// Setar um time como campeão (apenas admin)
        /// </summary>
        [HttpPost("{inscricaoId}/campeao")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DefinirCampeao(int inscricaoId, CancellationToken cancellationToken)
        {

            var adminUserId = GetUserId();

            var result = await _inscricaoService.DefinirCampeaoAsync(inscricaoId, adminUserId, cancellationToken);
            return FromResult(result);
        }


        /// <summary>
        /// Remover inscrição completamente (apenas admin)
        /// </summary>
        [HttpDelete("{inscricaoId}/removerInscricao")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoverInscricao(int inscricaoId, CancellationToken cancellationToken)
        {

            var adminUserId = GetUserId();

            var result = await _inscricaoService.RemoverInscricaoAsync(inscricaoId, adminUserId,cancellationToken);
            return FromResult(result);
        }

    }
}
