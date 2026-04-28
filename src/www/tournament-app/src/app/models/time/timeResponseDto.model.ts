import { UsuarioResponseDto } from "../auth/usuarioResponseDto.model";

export interface TimeResponseDto {
  id: number;
  nome: string;
  clanTag?: string;
  logoUrl?: string;
  dataCriacao: Date;
  lider?: string;
  liderId?: string;
  totalJogadores: number;

  jogadores: UsuarioResponseDto[];
}