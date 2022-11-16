import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { BONUS_LETTER } from '@common/constants/reserve-constant';
import { CommandType, Orientation } from '@common/enums/enums';
import { Position, WordOnBoard } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { Service } from 'typedi';

export const FROM_VIRTUAL_PLAYER = 'Virtual Player';

const BOARD_WORD_MARKER = '`';

const CHARACTER_TRANSFORMATION = 97;

@Service()
export class CommandHandlerService {
    deepCopyCommand(command: PlaceCommand): PlaceCommand {
        return {
            commandType: command.commandType,
            senderName: command.senderName,

            placement: { coordH: command.placement.coordH, coordV: command.placement.coordV },
            lettersToPlace: command.lettersToPlace,
            orientation: command.orientation,
        };
    }

    isLegalCommand(command: PlaceCommand): boolean {
        return this.isInBounds(command) && this.isLegalPosition(command.placement);
    }

    isInBounds(command: PlaceCommand): boolean {
        const endH =
            command.orientation === Orientation.Horizontal ? command.placement.coordH + command.lettersToPlace.length - 1 : command.placement.coordH;
        const endV =
            command.orientation === Orientation.Vertical ? command.placement.coordV + command.lettersToPlace.length - 1 : command.placement.coordV;
        const endPosition = { coordH: endH, coordV: endV };
        return this.isLegalPosition(endPosition);
    }

    generatePlaceCommand(wordOnBoard: WordOnBoard, potentialWord: string[]): PlaceCommand {
        let lettersToPlace = '';
        let firstLetterNotFound = true;
        const position: Position = { ...wordOnBoard.position };
        for (let i = 0; i < potentialWord.length; i++) {
            if (!potentialWord[i].includes(BOARD_WORD_MARKER)) {
                lettersToPlace += this.takeOffBonusStar(potentialWord[i]);
            } else {
                if (firstLetterNotFound) {
                    this.specifyPlacement(i, wordOnBoard.orientation, position, wordOnBoard.word.length);
                    firstLetterNotFound = false;
                }
            }
        }
        return {
            senderName: FROM_VIRTUAL_PLAYER,

            commandType: CommandType.Place,
            lettersToPlace,
            placement: position,
            orientation: wordOnBoard.orientation,
        };
    }

    convertPlaceCommandIntoString(command: PlaceCommand): string {
        const verticalCoordinate = String.fromCharCode(command.placement.coordV + CHARACTER_TRANSFORMATION);
        let orientation = '';
        if (command.orientation === Orientation.Horizontal) {
            orientation = 'h';
        }
        if (command.orientation === Orientation.Vertical) {
            orientation = 'v';
        }
        return '!placer ' + verticalCoordinate + (command.placement.coordH + 1) + orientation + ' ' + command.lettersToPlace;
    }

    containsBonusLetter(letters: string) {
        for (const letter of letters) {
            if (letter === letter.toUpperCase()) return true;
        }
        return false;
    }
    private takeOffBonusStar(lettersToPlace: string): string {
        if (lettersToPlace.includes(BONUS_LETTER)) {
            lettersToPlace = lettersToPlace.substr(0, lettersToPlace.length - 1);
        }
        return lettersToPlace;
    }

    private isLegalPosition(position: Position): boolean {
        return position.coordH >= 0 && position.coordV >= 0 && position.coordH <= MAX_BOARD_WIDTH && position.coordV <= MAX_BOARD_WIDTH;
    }

    private specifyPlacement(index: number, orientation: Orientation, position: Position, wordSize: number) {
        let adjustment = 0;
        if (index === 0) adjustment = wordSize;
        if (orientation === Orientation.Horizontal) {
            position.coordH = position.coordH - index + adjustment;
        }
        if (orientation === Orientation.Vertical) {
            position.coordV = position.coordV - index + adjustment;
        }
    }
}
