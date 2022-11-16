import { Room } from '@app/classes/interfaces/room';
import { EMPTY_ROOM_CLIENT } from '@common/constants/room-constants';
import { TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { Subject } from 'rxjs';

export const EMPTY_ROOM: Room = {
    ...JSON.parse(JSON.stringify(EMPTY_ROOM_CLIENT)),
    drawEvent: new Subject(),
    skipEvent: new Subject(),
    exchangeEvent: new Subject(),
    placeEvent: new Subject(),
    boardWordsEvent: new Subject(),
    dateBegin: new Date(),
};

export const TEST_ROOM: Room = {
    ...JSON.parse(JSON.stringify(TEST_ROOM_CLIENT)),
    drawEvent: new Subject(),
    skipEvent: new Subject(),
    exchangeEvent: new Subject(),
    placeEvent: new Subject(),
    boardWordsEvent: new Subject(),
    dateBegin: new Date(),
};
