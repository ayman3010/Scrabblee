import { CommandType, Orientation } from '@common/enums/enums';
import { Command, ExchangeCommand, PlaceCommand } from '@common/interfaces/command-interface';
import { Position } from '@common/interfaces/vec2';

export const DEFAULT_POSITION: Position = {
    coordH: 0,
    coordV: 0,
};

export const DEFAULT_COMMAND: Command = {
    commandType: CommandType.None,
    senderName: '',
};

export const DEFAULT_EXCHANGE_COMMAND: ExchangeCommand = {
    commandType: CommandType.None,
    letters: '',
    senderName: '',
};

export const DEFAULT_PLACE_COMMAND: PlaceCommand = {
    commandType: CommandType.None,
    lettersToPlace: '',
    placement: JSON.parse(JSON.stringify(DEFAULT_POSITION)),
    orientation: Orientation.Horizontal,
    senderName: '',
};
