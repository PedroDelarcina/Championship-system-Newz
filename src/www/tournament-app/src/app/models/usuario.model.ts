import { Inscricao } from "./inscricao.model";

export interface Usuario {
    id: string;
    nickName: string;
    email: string;
    isAdmin: boolean;
    dataRegistro: Date;

    inscricoes: Inscricao[];
}