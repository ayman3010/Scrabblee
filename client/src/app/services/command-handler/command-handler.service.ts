import { Injectable } from '@angular/core';
import { NUMBER_OF_TILES } from '@app/classes/constants/board-dimensions';
import { DEFAULT_COMMAND, DEFAULT_EXCHANGE_COMMAND, DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
import { CommandType, Orientation } from '@common/enums/enums';
import { Command, ExchangeCommand, PlaceCommand } from '@common/interfaces/command-interface';
import { Position } from '@common/interfaces/vec2';

export const MAX_WORD_LENGTH = 7;
export const BOARD_LENGTH = NUMBER_OF_TILES;
export const LETTER_A_VALUE_ASCII = 65;
export const VALID_COMMANDS_TYPE = [CommandType.Place, CommandType.Pass, CommandType.Exchange, CommandType.Hint, CommandType.Help];
export const VALID_ORIENTATIONS = ['v', 'h', ' '];

@Injectable({
    providedIn: 'root',
})
export class CommandHandlerService {
    isCommand(message: string): boolean {
        return message.startsWith('!');
    }

    isValidCommandSyntax(commandType: string): boolean {
        return VALID_COMMANDS_TYPE.includes(this.commandStringToEnum(commandType));
    }

    validateOrientationSyntax(orientation: string): boolean {
        return VALID_ORIENTATIONS.includes(orientation);
    }

    isStringNumber(stringInput: string): boolean {
        return /^\d+$/.test(stringInput);
    }

    isStringWord(stringInput: string): boolean {
        return /^[a-zA-Z*]+$/.test(stringInput);
    }

    turnOrientationToEnum(direction: string): Orientation {
        if (direction === 'h') {
            return Orientation.Horizontal;
        }
        if (direction === 'v') {
            return Orientation.Vertical;
        }
        return Orientation.Vertical;
    }

    populateCommandObject(commandArguments: string[], senderName: string): Command {
        const commandType = this.getCommandType(commandArguments[0]);
        switch (this.commandStringToEnum(commandType)) {
            case CommandType.Place: {
                if (this.isEnoughArguments(commandArguments, 3)) return this.getCommandPlace(commandArguments, senderName);
                else throw SyntaxError("Entrée invalide : nombre d'arguments invalide");
            }
            case CommandType.Exchange: {
                if (this.isEnoughArguments(commandArguments, 2)) return this.getCommandExchange(commandArguments, senderName);
                else throw SyntaxError("Entrée invalide : nombre d'arguments invalide");
            }
            case CommandType.Hint:
            case CommandType.Help:
            case CommandType.Pass: {
                if (this.isEnoughArguments(commandArguments, 1)) return this.getOneArgumentCommand(commandArguments, senderName);
                else throw SyntaxError("Entrée invalide : nombre d'arguments invalide");
            }
        }
        return { ...DEFAULT_COMMAND };
    }

    getCommandType(commandTypeInput: string): string {
        if (this.isValidCommandSyntax(commandTypeInput)) return commandTypeInput;
        else throw SyntaxError('Entrée invalide : Commande ' + commandTypeInput + ' inexistante');
    }

    isEnoughArguments(commandArguments: string[], numberOfArguments: number): boolean {
        return commandArguments.length === numberOfArguments;
    }

    getOneArgumentCommand(commandArguments: string[], senderName: string) {
        const command = { ...DEFAULT_COMMAND };
        command.commandType = this.commandStringToEnum(commandArguments[0]);
        command.senderName = senderName;
        return command;
    }

    getCommandExchange(commandArguments: string[], senderName: string): ExchangeCommand {
        const command = { ...DEFAULT_EXCHANGE_COMMAND };
        command.commandType = this.commandStringToEnum(commandArguments[0]);
        command.letters = this.getWord(commandArguments[1]);
        command.senderName = senderName;
        return command;
    }

    getCommandPlace(commandArguments: string[], senderName: string): PlaceCommand {
        const command = { ...DEFAULT_PLACE_COMMAND };
        const coordinatesString = commandArguments[2].length === 1 ? this.getOptionalCoordinatesString(commandArguments[1]) : commandArguments[1];
        const orientationString = coordinatesString.charAt(coordinatesString.length - 1);
        const positionString = coordinatesString.substring(0, coordinatesString.length - 1);
        command.commandType = this.commandStringToEnum(commandArguments[0]);
        command.orientation = this.getOrientation(orientationString);
        command.placement = this.getPosition(positionString);
        command.lettersToPlace = this.getWord(commandArguments[2]);
        if (command.lettersToPlace.length > MAX_WORD_LENGTH)
            throw SyntaxError('Commande impossible à réaliser : Le mot entré dépasse la limite de charactères pour un mot');
        command.senderName = senderName;
        if (this.isLegalPlacement(command)) return command;
        else throw SyntaxError('Commande impossible à réaliser : Placement hors limites');
    }

    getOptionalCoordinatesString(coordinatesInput: string): string {
        const charToCheck = coordinatesInput.charAt(coordinatesInput.length - 1);
        return this.isStringWord(charToCheck) ? coordinatesInput : coordinatesInput + ' ';
    }

    isLegalPlacement(command: PlaceCommand): boolean {
        const endH =
            command.orientation === Orientation.Horizontal ? command.placement.coordH + command.lettersToPlace.length - 1 : command.placement.coordH;
        const endV =
            command.orientation === Orientation.Vertical ? command.placement.coordV + command.lettersToPlace.length - 1 : command.placement.coordV;
        const endPosition = { coordH: endH, coordV: endV };
        return this.isInBounds(endPosition);
    }

    isInBounds(position: Position): boolean {
        return position.coordH >= 0 && position.coordV >= 0 && position.coordH < BOARD_LENGTH && position.coordV < BOARD_LENGTH;
    }

    getPosition(positionInput: string): Position {
        const coordHString = positionInput.substring(1, positionInput.length);
        const coordVString = positionInput.charAt(0);
        const position = { coordH: this.getCoordH(coordHString), coordV: this.getCoordV(coordVString) };
        if (this.isInBounds(position)) return position;
        else throw SyntaxError('Commande impossible à réaliser : Placement hors limites');
    }

    getOrientation(orientationInput: string): Orientation {
        const orientation = orientationInput.toLowerCase();
        if (this.validateOrientationSyntax(orientation)) return this.turnOrientationToEnum(orientation);
        else throw SyntaxError('Erreur de syntaxe : Orientation');
    }

    getCoordH(coordHInput: string): number {
        if (this.isStringNumber(coordHInput)) return +coordHInput - 1;
        else throw SyntaxError('Erreur de syntaxe : Coordonnée horizontale');
    }

    getCoordV(coordVInput: string): number {
        const coordV = coordVInput.charAt(0).toUpperCase();
        if (this.isStringWord(coordV)) return coordV.charCodeAt(0) - LETTER_A_VALUE_ASCII;
        else throw SyntaxError('Erreur de syntaxe : Coordonnée verticale');
    }

    getWord(wordInput: string): string {
        const word = wordInput;
        if (this.isStringWord(word)) return word;
        else throw SyntaxError('Erreur de syntaxe : Mot');
    }

    private commandStringToEnum(stringCommand: string): CommandType {
        switch (stringCommand) {
            case '!placer':
                return CommandType.Place;
            case '!échanger':
                return CommandType.Exchange;
            case '!passer':
                return CommandType.Pass;
            case '!indice':
                return CommandType.Hint;
            case '!aide':
                return CommandType.Help;
            default:
                return CommandType.None;
        }
    }
}
