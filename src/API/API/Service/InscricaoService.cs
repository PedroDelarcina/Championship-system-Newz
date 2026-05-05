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
            var inscricoes = await _inscricaoRepository.GetAllAsync(cancellationToken);

            return inscricoes.Select(i => new InscricaoListDto
            {
                Id = i.Id,
                DataInscricao = i.DataInscricao,
                Status = i.Status.ToString(),
                CampeonatoNome = i.Campeonato?.Nome ?? "Campeonato não encontrado",
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time?.Nome ?? "Time não encontrado",
                TimeTag = i.Time?.Clantag ?? string.Empty,
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
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time?.Nome ?? "Time não encontrado",
                TimeTag = i.Time?.Clantag ?? string.Empty,
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
                CampeonatoDataInicio = i.Campeonato?.DataInicio ?? DateTime.MinValue,
                TimeNome = i.Time?.Nome ?? "Time não encontrado",
                TimeTag = i.Time?.Clantag ?? string.Empty,
                TotalJogadores = i.Time?.Players.Count ?? 0
            });
        }

        public async Task<bool> AprovarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var atualizado = await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Confirmado, cancellationToken);

            if (!atualizado)
                throw new KeyNotFoundException("Inscrição não encontrada ou já processada.");

            _logger.LogInformation($"Inscrição {inscricaoId} aprovada pelo admin {adminUserId}.");

            return true;
        }

        public async Task<bool> CancelarInscricaoAsync(int inscricaoId, string usuarioId, CancellationToken cancellationToken)
        {
            var inscricao = await _inscricaoRepository.GetByIdAsync(inscricaoId, cancellationToken);
            if (inscricao == null)
                throw new KeyNotFoundException("Inscrição não encontrada.");

            var time = await _timeRepository.GetTimeWithJogadoresAsync(inscricao.TimeId, cancellationToken);

            var isLider = time?.Players?.Any(p => p.UsuarioId == usuarioId && p.isLider) ?? false;  
            var isAdmin = await _appDbContext.Users.AnyAsync(u => u.Id == usuarioId && u.IsAdmin, cancellationToken);   

            if(!isLider && !isAdmin)
                throw new UnauthorizedAccessException("Apenas o líder do time ou um admin pode cancelar a inscrição.");

            var campeonato = await _campeonatoRepository.GetByIdAsync(inscricao.CampeonatoId, cancellationToken);
            if (campeonato != null && campeonato.DataInicio <= DateTime.UtcNow)
                throw new InvalidOperationException("Não é possível cancelar a inscrição de um campeonato que já começou.");

            await _inscricaoRepository.DeleteAsync(inscricao, cancellationToken);

            _logger.LogInformation($"Inscrição {inscricaoId} cancelada pelo usuário {usuarioId}.");

            return true;
        }

        public async Task<bool> DefinirCampeonatoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
           var inscricao = await _inscricaoRepository.GetByIdAsync(inscricaoId, cancellationToken);
            if (inscricao == null)
                throw new KeyNotFoundException("Inscrição não encontrada ou já processada.");

            await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Campeao, cancellationToken);

            var campeonato = await _campeonatoRepository.GetByIdAsync(inscricao.CampeonatoId, cancellationToken);
            if (campeonato != null)
            {
                var time = await _timeRepository.GetByIdAsync(inscricao.TimeId, cancellationToken);
                campeonato.Campeao = time?.Nome ?? "Time Campeão";
                await _campeonatoRepository.UpdateAsync(campeonato, cancellationToken);
            }

            _logger.LogInformation($"Time definido como campeão (inscrição {inscricaoId} definida como campeã pelo admin {adminUserId}.");

            return true;
        }

        public async Task<bool> EliminarTimeAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var atualizado = await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Eliminado, cancellationToken);
            if (!atualizado)
                throw new KeyNotFoundException("Inscrição não encontrada ou já processada.");

            _logger.LogInformation($"Time eliminado do campeonato (inscrição {inscricaoId} eliminada pelo admin {adminUserId}).");

            return true;

        }

        public async Task<int> InscreverTimeCampeonatoAsync(InscricaoRequestDto inscricaoRequestDto, string usuarioId, CancellationToken cancellationToken)
        {
            var campeonato = await _campeonatoRepository.GetByIdAsync(inscricaoRequestDto.CampeonatoId, cancellationToken);

            if (campeonato == null)
                throw new KeyNotFoundException("Campeonato não encontrado.");

            if (!campeonato.IsAtivo)
                throw new InvalidOperationException("Não é possível se inscrever em um campeonato inativo.");

            if(campeonato.DataInicio <= DateTime.UtcNow)
                throw new InvalidOperationException("Não é possível se inscrever em um campeonato que já começou.");

            var time = await _timeRepository.GetTimeWithJogadoresAsync(inscricaoRequestDto.TimeId, cancellationToken);
            if(time == null)
                throw new KeyNotFoundException("Time não encontrado.");

            var isLider = time.Players?.Any(p => p.UsuarioId == usuarioId && p.isLider) ?? false;
            if(!isLider)
                throw new UnauthorizedAccessException("Apenas o líder do time pode realizar a inscrição.");

            var totalInscricoes = await _inscricaoRepository.GetTotalInscritoCampeonatoAsync(inscricaoRequestDto.CampeonatoId, cancellationToken);
            if(totalInscricoes >= campeonato.MaxParticipantes)
                throw new InvalidOperationException("Número máximo de inscrições atingido para este campeonato.");

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

            return result.Id;
        }

        public async Task<bool> RejeitarInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var atualizado = await _inscricaoRepository.UpdateStatusInscricaoAsync(inscricaoId, StatusInscricao.Cancelado, cancellationToken);

            if (!atualizado)
                throw new KeyNotFoundException("Inscrição não encontrada ou já processada.");

            _logger.LogInformation($"Inscrição {inscricaoId} rejeitada pelo admin {adminUserId}.");

            return true;
        }

        public async Task<bool> RemoverInscricaoAsync(int inscricaoId, string adminUserId, CancellationToken cancellationToken)
        {
            var inscricao = await _inscricaoRepository.GetByIdAsync(inscricaoId, cancellationToken);
            if (inscricao == null)
                throw new KeyNotFoundException("Inscrição não encontrada.");

            await _inscricaoRepository.DeleteAsync(inscricao, cancellationToken);

            _logger.LogInformation($"Inscrição {inscricaoId} removida pelo admin {adminUserId}.");

            return true;

        }
    }
}
