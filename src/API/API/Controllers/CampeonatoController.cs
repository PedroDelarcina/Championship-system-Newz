using API.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.DTOs.Campeonato;
using Core.Entities.Enums;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampeonatoController : BaseController
    {
        private readonly ICampeonatoService _campeonatoService;
        private readonly ILogger<CampeonatoController> _logger;

        public CampeonatoController(ICampeonatoService campeonatoService, ILogger<CampeonatoController> logger)
        {
            _campeonatoService = campeonatoService;
            _logger = logger;
        }


        /// <summary>
        /// Listar todos os campeonatos (público)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ObterTodosCampeonatos(CancellationToken cancellationtoken) 
        {
            var result = await _campeonatoService.ObterTodosCampeonatos(cancellationtoken);

            return Ok(result);
        }

        /// <summary>
        /// Lista os campeonatos ativos (público). Deve vir antes de {id} para não capturar "Ativos" como id.
        /// </summary>
        [HttpGet("Ativos")]
        [AllowAnonymous]
        public async Task<IActionResult> ObterCampeonatosAtivos (CancellationToken cancellationToken)
        {
            var result = await _campeonatoService.ObterCampeonatosAtivosAsync(cancellationToken);

            return Ok(result);
        }

        /// <summary>
        /// Buscar campeonato por ID (público)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> ObterCampeonatosById (int id, CancellationToken cancellationToken)
        {
            var result = await _campeonatoService.ObterCampeonatoPorIdAsync(id, cancellationToken);
            if(result == null)
            {
                return NotFound(new { message = "Campeonato não encontrado" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Criar um novo campeonato (apenas admin)
        /// </summary>
        [HttpPost("Criar")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CriarCampeonato([FromBody] CampeonatoRequestDto campDto, CancellationToken cancellationToken)
        {
            var adminUserId = GetUserId();

            var result = await _campeonatoService.CriarCampeonatoAsync(campDto, adminUserId, cancellationToken);
            return FromResult(result);

        }

        ///<summary>
        /// Atualizar os campeonatos (admin)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AtualizaCampeonato(int id, [FromBody] CampeonatoRequestDto campeonatoRequestDto, CancellationToken cancellationToken)
        {
         
             var adminUserId = GetUserId();

             var result = await _campeonatoService.AtualizarCampeonatoAsync(id, campeonatoRequestDto, adminUserId, cancellationToken);
             return FromResult(result);
        }

        ///<summary>
        /// Alternar Status dos campeonatos (admin)
        /// </summary>
        [HttpPatch("{id}/alternar-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AlternarStatusCampeonato (int id, CancellationToken cancellationToken)
        {

             var adminUserId = GetUserId();

             var result = await _campeonatoService.AlternarStatusCampeonatoAsync(id, adminUserId, cancellationToken);
             return FromResult(result);

        }


        ///<summary>
        /// Deletar campeonatos (admin)
        ///</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletarCampeonato (int id, CancellationToken cancellationToken)
        {

             var adminUserId = GetUserId();

             var result = await _campeonatoService.DeletarCampeonatoAsync(id, adminUserId, cancellationToken);
             return FromResult(result);
        }
    }
}
