import { TimeRequestDto } from "../time/timeRequestDto.model";

export interface InscricaoRequestDto {
  campeonatoId: number;
  time: TimeRequestDto;
}