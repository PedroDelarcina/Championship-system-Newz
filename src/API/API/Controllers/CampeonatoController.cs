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
    public class CampeonatoController : BaseController
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
        /// Buscar campeonato por ID (público)
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

        /// <summary>
        /// Lista os campeonatos ativos (público)
        /// </summary>
        [HttpGet("Ativos")]
        [AllowAnonymous]
        public async Task<IActionResult> ObterCampeonatosAtivos (CancellationToken cancellationToken)
        {
            var campeonatos = await _campeonatoRepository.GetCampeonatosAtivosAsync(cancellationToken);
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
        /// Criar um novo campeonato (apenas admin)
        /// </summary>
        [HttpPost("Criar")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CriarCampeonato([FromBody] CampeonatoRequestDto campDto, CancellationToken cancellationToken)
        {
            try
            {
                if (campDto.DataInicio >= campDto.DataFim)
                {
                    return BadRequest(new { message = "A data de início deve ser anterior à data de fim." });
                }
                
                if(campDto.DataInicio < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "A data de início não pode ser no passado." });
                }

                var conflito = await _campeonatoRepository.ExisteCampeonatosAtivosAsync(campDto.DataInicio, campDto.DataFim);
                if(conflito)
                    return BadRequest(new { message = "Já existe um campeonato ativo nesse período." });

                var campeonato = new Campeonato
                {
                    Nome = campDto.Nome,
                    TipoCampeonato = campDto.TipoCampeonato,
                    DescricaoRegras = campDto.DescricaoRegras,
                    DataInicio = campDto.DataInicio,
                    DataFim = campDto.DataFim,
                    MaxParticipantes = campDto.MaxParticipantes,
                    RegrasExtras = campDto.RegrasExtras,
                    IsAtivo = true
                };

                var result = await _campeonatoRepository.AddAsync(campeonato, cancellationToken);

                _logger.LogInformation($"Campeonato criado com sucesso: {result.Nome} por admin {GetUserId()}");

                return Ok(new { message = "Campeonato criado com sucesso", campeonatoId = result.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar campeonato");
                return StatusCode(500, new { message = "Erro interno ao processar solicitação" });
            }
        }

        ///<summary>
        /// Atualizar os campeonatos (admin)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AtualizaCampeonato([FromBody] CampeonatoRequestDto campeonatoRequestDto, int id, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                return NotFound(new { message = "Campeonato não encontrado" });

            if (campeonatoRequestDto.DataInicio >= campeonatoRequestDto.DataFim)
                return BadRequest(new { message = "Data de início deve ser anterior à data de fim" });

            var conflito = await _campeonatoRepository.ExisteCampeonatosAtivosAsync(campeonatoRequestDto.DataInicio, campeonatoRequestDto.DataFim, id, cancellationToken);
            if (conflito)
                return BadRequest(new { message = "Já existe outro campeonato ativo nesse periodo" });

            campeonato.Nome = campeonatoRequestDto.Nome;
            campeonato.TipoCampeonato = campeonatoRequestDto.TipoCampeonato;
            campeonato.DescricaoRegras = campeonatoRequestDto.DescricaoRegras;
            campeonato.DataInicio = campeonatoRequestDto.DataInicio;
            campeonato.DataFim = campeonatoRequestDto.DataFim;
            campeonato.MaxParticipantes = campeonatoRequestDto.MaxParticipantes;
            campeonato.RegrasExtras = campeonatoRequestDto.RegrasExtras;

            await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);
            _logger.LogInformation($"Campeonato atualizado: {campeonato.Nome} por admin {GetUserId()}");

            return Ok(new { message = "Campeonato atualizado com sucesso" });
           
        }

        ///<summary>
        /// Alternar Status dos campeonatos (admin)
        /// </summary>
        [HttpPatch("{id}/alternar-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AlternarStatusCampeonato (int id, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                return NotFound(new { message = "Campeonato não encontrado" });

            campeonato.IsAtivo = !campeonato.IsAtivo;
            await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);

            var status = campeonato.IsAtivo ? "ativado" : "desativado";
            return Ok(new { message = $"Campeonato {status} com sucesso" });
        }


        ///<summary>
        /// Deletar campeonatos (admin)
        ///</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletarCampeonato (int id, CancellationToken cancellationToken)
        { 
            var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if(campeonato == null)
                return NotFound(new { message = "Campeonato não encontrado" });

            if(campeonato.Inscricoes != null && campeonato.Inscricoes.Any())
                return BadRequest(new { message = "Não é possível deletar um campeonato com inscrições ativas" });

            await _campeonatoRepository.DeleteAsync(campeonato, cancellationToken);
            _logger.LogInformation($"Campeonato deletado: {campeonato.Nome} por admin {GetUserId()}");

            return Ok(new { message = "Campeonato deletado com sucesso" });
        }
    }
}
