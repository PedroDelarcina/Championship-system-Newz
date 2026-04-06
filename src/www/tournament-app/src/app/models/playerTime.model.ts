import { Usuario } from "./usuario.model";

export interface PlayerTime {
  timeId: number;
  usuarioId: string;
  isLider: boolean;
  player?: Usuario;
}