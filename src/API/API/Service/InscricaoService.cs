using Core.DTOs.Campeonato;
using Core.DTOs.Inscricao;
using Core.Entities;
using Core.Entities.Enums;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Service
{
    public class InscricaoService : IInscricaoService
    {
        private readonly ILogger _logger; 
        private readonly ICampeonatoRepository _campeonatoRepository;
        private readonly ITimeRepository _timeRepository;
        private readonly IInscricaoRepository _inscricaoRepository;
        private readonly AppDbContext _appDbContext;

        public InscricaoService(
            ILogger<InscricaoService> logger, 
            IInscricaoRepository inscricaoRepository,
            ICampeonatoRepository campeonatoRepository,
            ITimeRepository timeRepository,
            AppDbContext appDbContext)
        {
            _logger = logger;
            _inscricaoRepository = inscricaoRepository;
            _campeonatoRepository = campeonatoRepository;
            _timeRepository = timeRepository;
            _appDbContext = appDbContext;
        }

        public async Task<IEnumerable<InscricaoListDto>> ObterTodasInscricoesAsync(CancellationToken cancellationToken)
        {
            var inscricoes = await _inscricaoRepository.GetAllWithIncludesAsync(cancellationToken);

            return inscricoes.Select(i => new InscricaoListDto
            {
                Id = i.Id,
                DataInscricao = i.DataInscricao,
                Status = i.Status.ToString(),
                CampeonatoNome = i.Campeonato?.Nome ?? "Campeonato não encontrado",
                CampeonatoId = i.CampeonatoId,
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time?.Nome ?? "Time não encontrado",
                TimeTag = i.Time?.Clantag ?? string.Empty,
                TimeId = i.TimeId,
                LogoUrl = i.Time?.LogoUrl,
                TotalJogadores = i.Time?.Players.Count ?? 0
            });
        }
        /*   public async Task<InscricaoResponseDto?> ObterInscricaoPorIdAsync(int id, string usuarioLogadoId, CancellationToken cancellationToken)
            {
                var inscricao = _inscricaoRepository.GetByIdAsync(id, cancellationToken);
                if (inscricao == null) return null;


                var isAdmin = await _appDbContext.Users.AnyAsync(u => u.Id == usuarioLogadoId && u.IsAdmin, cancellationToken);

                if (!isAdmin && inscricao.UsuarioId != usuarioLogadoId)
                    throw new UnauthorizedAccessException("Acesso negado. Você não tem permissão para visualizar esta inscrição.");

                return new InscricaoResponseDto
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
 
            } */

        public async Task<IEnumerable<InscricaoListDto>> ObterInscricoesCampeonatoAsync(int campeonatoId, CancellationToken cancellationToken)
        {
            var inscricoes = await _inscricaoRepository.GetInscricoesByCampeonatoIdAsync(campeonatoId, cancellationToken);

            return inscricoes.Select(i => new InscricaoListDto
            {
                Id = i.Id,
                DataInscricao = i.DataInscricao,
                Status = i.Status.ToString(),
                CampeonatoNome = i.Campeonato?.Nome ?? "Campeonato não encontrado",
                CampeonatoId = i.CampeonatoId,
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time?.Nome ?? "Time não encontrado",
                TimeTag = i.Time?.Clantag ?? string.Empty,
                TimeId = i.TimeId,
                LogoUrl = i.Time?.LogoUrl,
                TotalJogadores = i.Time?.Players.Count ?? 0
            }); 
        }

        public async Task<IEnumerable<InscricaoListDto>> ObterMinhasInscricoesAsync(string usuarioId, CancellationToken cancellationToken)
        {
            var inscricoes = await _inscricaoRepository.GetInscricoesByUsuarioIdAsync(usuarioId, cancellationToken);

            return inscricoes.Select(i => new InscricaoListDto
            {
                Id = i.Id,
                DataInscricao = i.DataInscricao,
                Status = i.Status.ToString(),
                CampeonatoNome = i.Campeonato?.Nome ?? "Campeonato não encontrado",
                CampeonatoId = i.CampeonatoId,
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time?.Nome ?? "Time não encontrado",
                TimeTag = i.Time?.Clantag ?? string.Empty,
                TimeId = i.TimeId,
                LogoUrl = i.Time?.LogoUrl,
                TotalJogadores = i.Time?.Players.Count ?? 0
            });
        }

        public async Task<AuthResult<bool>> AprovarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var atualizado = await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Confirmado, cancellationToken);

            if (!atualizado)
                return AuthResult<bool>.FailureResult("Inscrição não encontrada ou já processada.", 404);

            _logger.LogInformation($"Inscrição {inscricaoId} aprovada pelo admin {adminUserId}.");

            return AuthResult<bool>.SuccessResult(true);
        }

        public async Task<AuthResult<bool>> CancelarInscricaoAsync(int inscricaoId, string usuarioId, CancellationToken cancellationToken)
        {
            var inscricao = await _inscricaoRepository.GetByIdAsync(inscricaoId, cancellationToken);
            if (inscricao == null)
                return AuthResult<bool>.FailureResult("Inscrição não encontrada.", 404);

            var time = await _timeRepository.GetTimeWithJogadoresAsync(inscricao.TimeId, cancellationToken);

            var isLider = time?.Players?.Any(p => p.UsuarioId == usuarioId && p.isLider) ?? false;  
            var isAdmin = await _appDbContext.Users.AnyAsync(u => u.Id == usuarioId && u.IsAdmin, cancellationToken);   

            if(!isLider && !isAdmin)
                return AuthResult<bool>.FailureResult("Apenas o líder do time ou um administrador pode cancelar a inscrição.", 403);

            var campeonato = await _campeonatoRepository.GetByIdAsync(inscricao.CampeonatoId, cancellationToken);
            if (campeonato != null && campeonato.DataInicio <= DateTime.UtcNow)
                return AuthResult<bool>.FailureResult("Não é possível cancelar a inscrição em um campeonato que já começou.", 400);

            await _inscricaoRepository.DeleteAsync(inscricao, cancellationToken);

            _logger.LogInformation($"Inscrição {inscricaoId} cancelada pelo usuário {usuarioId}.");

            return AuthResult<bool>.SuccessResult(true);
        }

        public async Task<AuthResult<bool>> DefinirCampeonatoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
           var inscricao = await _inscricaoRepository.GetByIdAsync(inscricaoId, cancellationToken);
            if (inscricao == null)
                return AuthResult<bool>.FailureResult("Inscrição não encontrada ou já processada.", 404);

            await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Campeao, cancellationToken);

            var campeonato = await _campeonatoRepository.GetByIdAsync(inscricao.CampeonatoId, cancellationToken);
            if (campeonato != null)
            {
                var time = await _timeRepository.GetByIdAsync(inscricao.TimeId, cancellationToken);
                campeonato.Campeao = time?.Nome ?? "Time Campeão";
                await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);
            }

            _logger.LogInformation($"Time definido como campeão (inscrição {inscricaoId} definida como campeã pelo admin {adminUserId}.");

            return AuthResult<bool>.SuccessResult(true);
        }

        public async Task<AuthResult<bool>> EliminarTimeAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var atualizado = await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Eliminado, cancellationToken);
            if (!atualizado)
                return AuthResult<bool>.FailureResult("Inscrição não encontrada ou já processada.", 404);

            _logger.LogInformation($"Time eliminado do campeonato (inscrição {inscricaoId} eliminada pelo admin {adminUserId}).");

            return AuthResult<bool>.SuccessResult(true);

        }

        public async Task<AuthResult<int>> InscreverTimeCampeonatoAsync(InscricaoRequestDto inscricaoRequestDto, string usuarioId, CancellationToken cancellationToken) 
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(inscricaoRequestDto.CampeonatoId, cancellationToken);

            if (campeonato == null)
                return AuthResult<int>.FailureResult("Campeonato não encontrado.", 404);

            if(campeonato.DataInicio <= DateTime.UtcNow)
                return AuthResult<int>.FailureResult("Não é possível se inscrever em um campeonato que já começou.", 400);

            var time = await _timeRepository.GetTimeWithJogadoresAsync(inscricaoRequestDto.TimeId, cancellationToken);
            if(time == null)
                return AuthResult<int>.FailureResult("Time não encontrado.", 404);

            var isLider = time.Players?.Any(p => p.UsuarioId == usuarioId && p.isLider) ?? false;
            if(!isLider)
                return AuthResult<int>.FailureResult("Apenas o líder do time pode realizar a inscrição.", 403);

            var inscricaoExistente = await _inscricaoRepository.GetInscricaoByCampeonatoAndTimeAsync(
                inscricaoRequestDto.CampeonatoId,
                inscricaoRequestDto.TimeId,
                cancellationToken);

            if (inscricaoExistente != null &&
                (inscricaoExistente.Status == StatusInscricao.Pendente ||
                 inscricaoExistente.Status == StatusInscricao.Confirmado ||
                 inscricaoExistente.Status == StatusInscricao.Eliminado ||
                 inscricaoExistente.Status == StatusInscricao.Campeao))
            {
                return AuthResult<int>.FailureResult("Este time já possui inscrição ativa neste campeonato.", 400);
            }

            var totalInscricoes = await _inscricaoRepository.GetTotalInscritoCampeonatoAsync(inscricaoRequestDto.CampeonatoId, cancellationToken);
            if(totalInscricoes >= campeonato.MaxParticipantes)
                return AuthResult<int>.FailureResult("Número máximo de inscrições atingido para este campeonato.", 400);

            var inscricao = new Inscricao
            {
                CampeonatoId = inscricaoRequestDto.CampeonatoId,
                TimeId = inscricaoRequestDto.TimeId,
                UsuarioId = usuarioId,
                DataInscricao = DateTime.UtcNow,
                Status = StatusInscricao.Pendente
            };

            var result = await _inscricaoRepository.AddAsync(inscricao, cancellationToken);

            _logger.LogInformation($"Time {time.Nome} inscrito no campeonato {campeonato.Nome} pelo usuário {usuarioId}.");

            return AuthResult<int>.SuccessResult(result.Id);
        }

        public async Task<AuthResult<bool>> RejeitarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var atualizado = await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Cancelado, cancellationToken);

            if (!atualizado)
                return AuthResult<bool>.FailureResult("Inscrição não encontrada ou já processada.", 404);

            _logger.LogInformation($"Inscrição {inscricaoId} rejeitada pelo admin {adminUserId}.");

            return AuthResult<bool>.SuccessResult(true);
        }

        public async Task<AuthResult<bool>> RemoverInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var inscricao = await _inscricaoRepository.GetByIdAsync(inscricaoId, cancellationToken);
            if (inscricao == null)
                return AuthResult<bool>.FailureResult("Inscrição não encontrada.", 404);

            if (inscricao.Status == StatusInscricao.Campeao)
            {
                var campeonato = await _campeonatoRepository.GetByIdAsync(inscricao.CampeonatoId, cancellationToken);
                if (campeonato != null)
                {
                    var time = await _timeRepository.GetByIdAsync(inscricao.TimeId, cancellationToken);
                    if (time != null && campeonato.Campeao == time.Nome)
                    {
                        campeonato.Campeao = null;
                        await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);
                    }
                }
            }

            await _inscricaoRepository.DeleteAsync(inscricao, cancellationToken);

            _logger.LogInformation($"Inscrição {inscricaoId} removida pelo admin {adminUserId}.");

            return AuthResult<bool>.SuccessResult(true);

        }
    }
}
