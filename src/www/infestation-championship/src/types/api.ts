export interface UsuarioResponseDto {
  id: string;
  email: string;
  nickName: string;
  isAdmin: boolean;
  dataRegistro: string;
}

export interface TokenResponseDto {
  token: string;
  expiration: string;
  userId: string;
  email: string;
  nickname: string;
  isAdmin: boolean;
}

export interface RegistroResponseDto {
  message: string;
  user: UsuarioResponseDto;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegistroDto {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
  nickname: string;
}

export type StatusCampeonato =
  | "NaoIniciado"
  | "EmAndamento"
  | "Finalizado"
  | string;

export interface CampeonatoResponseDto {
  id: number;
  nome: string;
  tipo: string;
  descricaoRegras: string;
  dataInicio: string;
  dataFim: string;
  isAtivo: boolean;
  campeao?: string | null;
  regrasExtras?: string | null;
  totalInscricoes: number;
  status?: StatusCampeonato;
}

export interface CampeonatoRequestDto {
  nome: string;
  tipoCampeonato: string;
  descricaoRegras: string;
  maxParticipantes: number;
  dataInicio: string;
  dataFim: string;
  regrasExtras?: string;
}

export interface TimeListDto {
  id: number;
  nome: string;
  clanTag?: string | null;
  logoUrl?: string | null;
  dataCriacao: string;
  totalJogadores: number;
  liderNickname?: string | null;
}

export interface TimeResponseDto {
  id: number;
  nome: string;
  clanTag?: string | null;
  logoUrl?: string | null;
  dataCriacao: string;
  jogadores: UsuarioResponseDto[];
  lider?: string | null;
  liderId?: string | null;
  totalJogadores: number;
}

export interface TimeRequestDto {
  nome: string;
  clanTag?: string;
  logoUrl?: string;
  liderId?: string;
}

export interface AddPlayerTimeDto {
  timeId: number;
  usuarioId: string;
  isLider?: boolean;
}

export type StatusInscricao =
  | "Pendente"
  | "Confirmado"
  | "Cancelado"
  | "Eliminado"
  | "Campeao"
  | string;

export interface InscricaoListDto {
  id: number;
  dataInscricao: string;
  status: StatusInscricao;
  campeonatoNome: string;
  campeonatoDataInicio: string;
  timeNome: string;
  timeTag: string;
  totalJogadores: number;
}

export interface InscricaoRequestDto {
  campeonatoId: number;
  timeId: number;
}

export interface CampeonatoDetalhes extends CampeonatoResponseDto {
  inscricoes: InscricaoListDto[];
}

export type User = UsuarioResponseDto;
export type Campeonato = CampeonatoResponseDto;
export type Time = TimeResponseDto;
export type Inscricao = InscricaoListDto;
