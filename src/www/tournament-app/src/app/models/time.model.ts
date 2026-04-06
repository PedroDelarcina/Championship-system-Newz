import { PlayerTime } from "./playerTime.model";

export interface Time{
    id: number;
    nome: string;
    clanTag?: string;
    players: PlayerTime[];
}