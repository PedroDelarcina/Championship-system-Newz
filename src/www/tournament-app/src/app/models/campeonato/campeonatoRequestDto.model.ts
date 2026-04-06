export interface CampeonatoRequestDto {
  nome: string;
  tipoCampeonato: string; // "ClanxClan", "Solo", "Dupla", "Trios"
  descricaoRegras: string;
  dataInicio: Date;
  dataFim: Date;
  regrasExtras?: string;
}