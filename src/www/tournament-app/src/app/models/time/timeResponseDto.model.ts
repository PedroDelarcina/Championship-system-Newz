import { UsuarioResponseDto } from "../auth/usuarioResponseDto.model";

export interface TimeResponseDto {
  id: number;
  nome: string;
  clanTag?: string;
  logoUrl?: string;
  dataCriacao: Date;
  jogadores: UsuarioResponseDto[];
  lider?: UsuarioResponseDto;
  totalJogadores: number;
}