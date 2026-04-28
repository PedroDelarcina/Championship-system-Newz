import { Inscricao } from "./inscricao.model";

export type TipoCampeonato = 'ClansxClans' | 'Solo' | 'Duplas' | 'Times';

export interface Campeonato {
  id: number;
  nome: string;
  tipoCampeonato: TipoCampeonato;
  dataInicio: Date;
  dataFim: Date;
  descricaoRegras: string;
  regrasExtras?: string;
  isAtivo: boolean;
  maxParticipantes: number;
  campeao?: string;
  status?: string;

inscricoes: Inscricao[];
}