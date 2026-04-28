export interface CampeonatoRequestDto {
  nome: string;
  tipoCampeonato: string; // "ClanxClan", "Solo", "Dupla", "Trios"
  descricaoRegras: string;
  maxParticipantes: number;
  dataInicio: Date;
  dataFim: Date;
  regrasExtras?: string;
}