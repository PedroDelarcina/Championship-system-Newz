

export type TipoCampeonato = 'ClansxClans' | 'Solo' | 'Duplas' | 'Times';

export interface Campeonato {
  id: number;
  nome: string;
  tipoCampeonato: TipoCampeonato;
  dataInicio: Date;
  dataFim: Date;
  isAtivo: boolean;
  maxParticipantes: number;
  campeao?: string;
}