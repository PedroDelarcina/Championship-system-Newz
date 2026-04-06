export type StatusInscricao = 'Pendente' | 'Confirmado' | 'Eliminado' | 'Campeao' | 'Cancelado';

export interface InscricaoListDto {
  id: number;
  dataInscricao: Date;
  status: StatusInscricao;
  campeonatoNome: string;
  campeonatoDataInicio: Date;
  timeNome: string;
  timeTag: string;
  totalJogadores: number;
}