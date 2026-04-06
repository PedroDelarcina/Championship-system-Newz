using API.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.DTOs.Campeonato;
using Core.Interfaces;
using Core.Entities.Enums;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampeonatoController : ControllerBase
    {
        private readonly ICampeonatoRepository _campeonatoRepository;
        private readonly ILogger<CampeonatoController> _logger;

        public CampeonatoController(ICampeonatoRepository campeonatoRepository, ILogger<CampeonatoController> logger)
        {
            _campeonatoRepository = campeonatoRepository;
            _logger = logger;
        }


        /// <summary>
        /// Listar todos os campeonatos (público)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ObterTodosCampeonatos(CancellationToken cancellationtoken) 
        {
            var campeonatos = await _campeonatoRepository.GetAllAsync(cancellationtoken);
            var result = campeonatos.Select(c => new CampeonatoResponseDto
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.TipoCampeonato,
                DataInicio = c.DataInicio,
                DataFim = c.DataFim,
                IsAtivo = c.IsAtivo,
                TotalInscricoes = c.Inscricoes?.Count ?? 0
            });

            return Ok(result);
        }

        /// <summary>
        /// Buscar campeonato por ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> ObterCampeonatosById (int id, CancellationToken cancellationToken)
        {
            var campeonatoId = await _campeonatoRepository.GetCampeonatoInscricoesAsync(id, cancellationToken);
            if(campeonatoId == null)
            {
                return NotFound(new { message = "Campeonato não encontrado" });
            }

            var result = new CampeonatoResponseDto
            {
                Id = campeonatoId.Id,
                Nome = campeonatoId.Nome,
                Tipo = campeonatoId.TipoCampeonato,
                DescricaoRegras = campeonatoId.DescricaoRegras,
                DataInicio = campeonatoId.DataInicio,
                DataFim = campeonatoId.DataFim,
                IsAtivo = campeonatoId.IsAtivo,
                Campeao = campeonatoId.Campeao,
                RegrasExtras = campeonatoId.RegrasExtras,
                TotalInscricoes = campeonatoId.Inscricoes?.Count ?? 0,
                Status = campeonatoId.DataInicio > DateTime.UtcNow ? "NaoIniciado" : campeonatoId.DataFim < DateTime.UtcNow ? "Finalizado" : "EmAndamento"
            };

            return Ok(result);
        }
    }
}
