import { Campeonato } from "./campeonato.model";
import { Time } from "./time.model";
import { Usuario } from "./usuario.model";

export type StatusInscricao = 'Pendente' | 'Confirmado' | 'Eliminado' | 'Campeao' | 'Cancelado';

export interface Inscricao {
  id: number;
  dataInscricao: Date;
  status: StatusInscricao;
  campeonatoId: number;
  timeId: number;
  usuarioId: string;


  campeonato?: Campeonato[];
  time?: Time[];
  usuario?: Usuario[];
}