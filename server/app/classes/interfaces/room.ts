import { WordOnBoard } from '@common/interfaces/board-interface';
import { ValidCommand } from '@common/interfaces/command-interface';
import { RoomClient } from '@common/interfaces/room';
import { Subject } from 'rxjs';

export interface Room extends RoomClient {
    drawEvent: Subject<void>;
    skipEvent: Subject<void>;
    exchangeEvent: Subject<string>;
    placeEvent: Subject<ValidCommand>;
    boardWordsEvent: Subject<WordOnBoard[]>;

    dateBegin: Date;
}
