export interface CampeonatoListDto {
  id: number;
  nome: string;
  tipo: string;
  dataInicio: Date;
  dataFim: Date;
  isAtivo: boolean;
  totalInscricoes: number;
}