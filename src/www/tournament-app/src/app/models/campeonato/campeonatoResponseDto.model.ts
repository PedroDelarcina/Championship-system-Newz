export interface CampeonatoResponseDto {
  id: number;
  nome: string;
  tipo: string;
  descricaoRegras: string;
  dataInicio: Date;
  dataFim: Date;
  isAtivo: boolean;
  campeao?: string;
  regrasExtras?: string;
  totalInscricoes: number;
  status: string; // "Em breve", "Aberto", "Em andamento", "Finalizado"
}