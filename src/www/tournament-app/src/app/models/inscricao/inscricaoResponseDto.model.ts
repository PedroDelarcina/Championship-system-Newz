import { CampeonatoListDto } from "../campeonato/campeonatoListDto.model";
import { TimeResponseDto } from "../time/timeResponseDto.model";
import { UsuarioResponseDto } from "../auth/usuarioResponseDto.model";
import { StatusInscricao } from "../inscricao.model";

export interface InscricaoResponseDto {
  id: number;
  dataInscricao: Date;
  status: StatusInscricao;


  campeonato: CampeonatoListDto[];
  time: TimeResponseDto[];
  usuario: UsuarioResponseDto[];
}