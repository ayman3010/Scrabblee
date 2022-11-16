import { CommandType, Orientation } from '@common/enums/enums';

export const NB_MAX_PLAYERS = 2;
export const DELAY_WRONG_PLACEMENT = 3000;
export const BINGO_BONUS_POINT = 50;
export const BASIC_COMMAND = {
    commandType: CommandType.None,
    senderName: '',
    lettersToPlace: '',
    orientation: Orientation.Horizontal,
    placement: { coordH: 0, coordV: 0 },
};
