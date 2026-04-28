import { PlayerTime } from "./playerTime.model";
import { Inscricao } from "./inscricao.model";

export interface Time{
    id: number;
    nome: string;
    clanTag?: string;
    dataCriacao: Date;
    logoUrl?: string;

    inscricao: Inscricao[];
    players: PlayerTime[];
}