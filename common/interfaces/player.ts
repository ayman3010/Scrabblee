import { Rack } from '@common/interfaces/rack-interface';

export interface Player {
    name: string;
    socketId: string;
    rack: Rack;
    isTurn: boolean;
    points: number;
    abandoned: boolean;
}
