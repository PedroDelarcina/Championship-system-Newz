using Core.DTOs.Campeonato;
using Core.Entities;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using System.Security.Cryptography;

namespace API.Service
{
    public class CampeonatoService : ICampeonatoService
    {
        private readonly ICampeonatoRepository _campeonatoRepository;
        private readonly ILogger<CampeonatoService> _logger;

        public CampeonatoService(ICampeonatoRepository campeonatoRepository, ILogger<CampeonatoService> logger)
        {
            _campeonatoRepository = campeonatoRepository;
            _logger = logger;
        }

        private static string CalcularStatus(DateTime dataInicio, DateTime dataFim)
        {
            var now = DateTime.UtcNow;
            if (dataInicio > now) return "NaoIniciado";
            if (dataFim < now) return "Finalizado";
            return "EmAndamento";
        }

        public async Task<IEnumerable<CampeonatoResponseDto>> ObterTodosCampeonatos(CancellationToken cancellationToken)
        {
            var campeonatos = await _campeonatoRepository.GetAllWithIncludesAsync(cancellationToken);

            return campeonatos.Select(c => new CampeonatoResponseDto
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.TipoCampeonato,
                DescricaoRegras = c.DescricaoRegras,
                DataInicio = c.DataInicio,
                DataFim = c.DataFim,
                IsAtivo = c.IsAtivo,
                Campeao = c.Campeao,
                RegrasExtras = c.RegrasExtras,
                TotalInscricoes = c.Inscricoes.Count(),
                Status = CalcularStatus(c.DataInicio, c.DataFim)
            });
        }

        public async Task<CampeonatoResponseDto?> ObterCampeonatoPorIdAsync(int id, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetCampeonatoInscricoesAsync(id, cancellationToken);
            
            if(campeonato == null) return null;

            return new CampeonatoResponseDto
            {
                Id = campeonato.Id,
                Nome = campeonato.Nome,
                Tipo = campeonato.TipoCampeonato,
                DescricaoRegras = campeonato.DescricaoRegras,
                DataInicio = campeonato.DataInicio,
                DataFim = campeonato.DataFim,
                IsAtivo = campeonato.IsAtivo,
                Campeao = campeonato.Campeao,
                RegrasExtras = campeonato.RegrasExtras,
                TotalInscricoes = campeonato.Inscricoes?.Count ?? 0,
                Status = CalcularStatus(campeonato.DataInicio, campeonato.DataFim)
            };
        }

        public async Task<IEnumerable<CampeonatoResponseDto>> ObterCampeonatosAtivosAsync(CancellationToken cancellationToken)
        {
            var campeonatos = await _campeonatoRepository.GetCampeonatosAtivosAsync(cancellationToken);

            return campeonatos.Select(c => new CampeonatoResponseDto
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.TipoCampeonato,
                DescricaoRegras = c.DescricaoRegras,
                DataInicio = c.DataInicio,
                DataFim = c.DataFim,
                IsAtivo = c.IsAtivo,
                Campeao = c.Campeao,
                RegrasExtras = c.RegrasExtras,
                TotalInscricoes = c.Inscricoes?.Count ?? 0,
                Status = CalcularStatus(c.DataInicio, c.DataFim)
            });
        }

        public async Task<bool> AlternarStatusCampeonatoAsync(int id, string adminUserId, CancellationToken cancellationToken)
        {
           var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                throw new KeyNotFoundException("Campeonato não encontrado");

            campeonato.IsAtivo = !campeonato.IsAtivo;
            await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);

            _logger.LogInformation($"Campeonato {(campeonato.IsAtivo ? "ativado" : "desativado")} por admin {adminUserId}");

            return true;
        }

        public async Task<bool> AtualizarCampeonatoAsync(int id, CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                throw new KeyNotFoundException("Campeonato não encontrado");

            if (requestDto.DataInicio >= requestDto.DataFim)
                throw new ArithmeticException("Data de início deve ser anterior à data de fim");

            var conflito = await _campeonatoRepository.ExisteCampeonatosAtivosAsync(requestDto.DataInicio, requestDto.DataFim, null, cancellationToken);
            if (conflito)
                throw new InvalidOperationException("Já existe outro campeonato ativo nesse período");

            campeonato.Nome = requestDto.Nome;
            campeonato.TipoCampeonato = requestDto.TipoCampeonato;
            campeonato.DescricaoRegras = requestDto.DescricaoRegras;
            campeonato.DataInicio = requestDto.DataInicio;
            campeonato.DataFim = requestDto.DataFim;
            campeonato.MaxParticipantes = requestDto.MaxParticipantes;
            campeonato.RegrasExtras = requestDto.RegrasExtras;

            await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);
            _logger.LogInformation($"Campeonato atualizado: {campeonato.Nome} por admin {adminUserId}");

            return true;
        }

        public async Task<int> CriarCampeonatoAsync(CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken)
        {
            if(requestDto.DataInicio >= requestDto.DataFim)
                throw new ArgumentException("Data de início deve ser anterior à data de fim.");
            if(requestDto.DataInicio < DateTime.UtcNow)
                throw new ArgumentException("Data de início não pode ser no passado.");

            var conflito = await _campeonatoRepository.ExisteCampeonatosAtivosAsync(requestDto.DataInicio, requestDto.DataFim, null, cancellationToken);
            if(conflito)
                throw new InvalidOperationException("Já existe um campeonato ativo no período informado.");

            var campeonato = new Campeonato
            {
                Nome = requestDto.Nome,
                TipoCampeonato = requestDto.TipoCampeonato,
                DescricaoRegras = requestDto.DescricaoRegras,
                MaxParticipantes = requestDto.MaxParticipantes,
                DataInicio = requestDto.DataInicio,
                DataFim = requestDto.DataFim,
                RegrasExtras = requestDto.RegrasExtras,
                IsAtivo = true
            };

            var result = await _campeonatoRepository.AddAsync(campeonato, cancellationToken);

            _logger.LogInformation($"Campeonato criado: {result.Nome} por admin {adminUserId}");

            return result.Id;
        }

        public async Task<bool> DeletarCampeonatoAsync(int id, string adminUserId, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                throw new KeyNotFoundException("Campeonato não encontrado");

            if (campeonato.Inscricoes != null && campeonato.Inscricoes.Any())
                throw new InvalidOperationException("Não é possivel  deletar um campeonato com inscrições ativas");

            await _campeonatoRepository.DeleteAsync(campeonato, cancellationToken);
            _logger.LogInformation($"Campeonato deletado: {campeonato.Nome} por admin {adminUserId}");

            return true;
        }

    }
}
