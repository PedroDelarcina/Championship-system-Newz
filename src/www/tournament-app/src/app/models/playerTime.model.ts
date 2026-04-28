import { Usuario } from "./usuario.model";
import { Time } from "./time.model";

export interface PlayerTime {
  timeId: number;
  usuarioId: string;
  isLider: boolean;

  time: Time[];
  player: Usuario[];
}