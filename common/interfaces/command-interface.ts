import { CommandType, Orientation } from '@common/enums/enums';
import { Position } from './vec2';

export interface Command {
    commandType: CommandType;
    senderName: string;
}
export interface PlaceCommand extends Command {
    lettersToPlace: string;
    orientation: Orientation;
    placement: Position;
}

export interface ExchangeCommand extends Command {
    letters: string;
}

export interface HintCommand extends Command {}

export interface PassCommand extends Command {}

export interface ValidCommand {
    command: PlaceCommand;
    points: number;
}
