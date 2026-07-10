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

        private static string CalcularStatus(bool isAtivo, DateTime dataInicio, DateTime dataFim)
        {
            if (!isAtivo) return "Desativado";
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
                Status = CalcularStatus(c.IsAtivo, c.DataInicio, c.DataFim)
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
                Status = CalcularStatus(campeonato.IsAtivo, campeonato.DataInicio, campeonato.DataFim)
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
                Status = CalcularStatus(c.IsAtivo, c.DataInicio, c.DataFim)
            });
        }

        public async Task<AuthResult<bool>> AlternarStatusCampeonatoAsync(int id, string adminUserId, CancellationToken cancellationToken)
        {
           var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                return AuthResult<bool>.FailureResult("Campeonato não encontrado", 404);

            campeonato.IsAtivo = !campeonato.IsAtivo;
            await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);

            _logger.LogInformation($"Campeonato {(campeonato.IsAtivo ? "ativado" : "desativado")} por admin {adminUserId}");

            return AuthResult<bool>.SuccessResult(true, "Status alterado com sucesso!");
        }

        public async Task<AuthResult<bool>> AtualizarCampeonatoAsync(int id, CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                return AuthResult<bool>.FailureResult("Campeonato não encontrado", 404);

            if (requestDto.DataInicio >= requestDto.DataFim)
                return AuthResult<bool>.FailureResult("Data de início deve ser inferior à data de fim", 400);

            var conflito = await _campeonatoRepository.ExisteCampeonatosAtivosAsync(requestDto.DataInicio, requestDto.DataFim, id, cancellationToken);
            if (conflito)
                return AuthResult<bool>.FailureResult("Já existe outro campeonato ativo nesse período", 400);

            campeonato.Nome = requestDto.Nome;
            campeonato.TipoCampeonato = requestDto.TipoCampeonato;
            campeonato.DescricaoRegras = requestDto.DescricaoRegras;
            campeonato.DataInicio = requestDto.DataInicio;
            campeonato.DataFim = requestDto.DataFim;
            campeonato.MaxParticipantes = requestDto.MaxParticipantes;
            campeonato.RegrasExtras = requestDto.RegrasExtras;

            await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);
            _logger.LogInformation($"Campeonato atualizado: {campeonato.Nome} por admin {adminUserId}");

            return AuthResult<bool>.SuccessResult(true, "Campeonato atualizado com sucesso.");
        }

        public async Task<AuthResult<int>> CriarCampeonatoAsync(CampeonatoRequestDto requestDto, string adminUserId, CancellationToken cancellationToken)
        {
            if(requestDto.DataInicio >= requestDto.DataFim)
                return AuthResult<int>.FailureResult("Data de início deve ser inferior à data de fim.", 400);
            if(requestDto.DataInicio < DateTime.UtcNow)
                return AuthResult<int>.FailureResult("Data de início não pode ser no passado.", 400);

            var conflito = await _campeonatoRepository.ExisteCampeonatosAtivosAsync(requestDto.DataInicio, requestDto.DataFim, null, cancellationToken);
            if(conflito)
                return AuthResult<int>.FailureResult("Já existe um campeonato ativo no período informado.", 400);

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

            return AuthResult<int>.SuccessResult(result.Id);
        }

        public async Task<AuthResult<bool>> DeletarCampeonatoAsync(int id, string adminUserId, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(id, cancellationToken);
            if (campeonato == null)
                return AuthResult<bool>.FailureResult("Campeonato não encontrado", 404);

            if (campeonato.Inscricoes != null && campeonato.Inscricoes.Any())
                return AuthResult<bool>.FailureResult("Não é possivel  deletar um campeonato com inscrições ativas", 400);

            await _campeonatoRepository.DeleteAsync(campeonato, cancellationToken);
            _logger.LogInformation($"Campeonato deletado: {campeonato.Nome} por admin {adminUserId}");

            return AuthResult<bool>.SuccessResult(true, "Campeonato deletado com sucesso!");
        }

    }
}
