export interface TimeListDto {
  id: number;
  nome: string;
  clanTag?: string;
  logoUrl?: string;
  dataCriacao: Date;
  totalJogadores: number;
  liderNickname?: string;
}