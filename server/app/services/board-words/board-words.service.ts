import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { BASIC_COMMAND } from '@app/classes/constants/game-manager-constant';
import { RACK_MAX_CAPACITY } from '@app/classes/constants/rack-constant';
import { PlacementIterator } from '@app/classes/placement-iterator/placement-iterator';
import { Orientation } from '@common/enums/enums';
import { Board, LinkedWordOnBoard, Position, WordOnBoard } from '@common/interfaces/board-interface';
import { Service } from 'typedi';

@Service()
export class BoardWordsService {
    listWordsOnboard(board: Board): LinkedWordOnBoard[] {
        return this.mergeHorizontalVertical(this.listLinkedWords(board, Orientation.Horizontal), this.listLinkedWords(board, Orientation.Vertical));
    }

    private listBoardWords(board: Board, orientation: Orientation): WordOnBoard[] {
        const words: WordOnBoard[] = [];
        let word = '';
        const iterator = new PlacementIterator(BASIC_COMMAND, board);
        const oppositeOrientation = iterator.getOppositeOrientation(orientation);
        iterator.setOrientation(oppositeOrientation);

        for (let coordH = 0; coordH <= MAX_BOARD_WIDTH; coordH++) {
            iterator.setOrientation(orientation);

            for (let coordV = 0; coordV <= MAX_BOARD_WIDTH; coordV++) {
                iterator.setPosition(this.reverseCoordForPosition({ coordH, coordV }, orientation));

                if (iterator.getLetterAtPosition(this.reverseCoordForPosition({ coordH, coordV }, orientation)) !== '') {
                    word += iterator.getLetterAtPosition(this.reverseCoordForPosition({ coordH, coordV }, orientation));

                    if (this.isLastLetterInWord(board, this.reverseCoordForPosition({ coordH, coordV }, orientation), orientation)) {
                        const beginningWordCoord = iterator.getCoordWithOrientation(orientation) - word.length + 1;
                        iterator.setCoordWithOrientation(beginningWordCoord, orientation);
                        words.push({ position: iterator.getPosition(), orientation, word });
                        word = '';
                    }
                }
            }
            iterator.setOrientation(oppositeOrientation);
        }
        if (words.length === 0) {
            words.push({ position: { coordH: 7, coordV: 7 }, word: '', orientation });
        }
        return words;
    }

    private listLinkedWords(board: Board, orientation: Orientation): LinkedWordOnBoard[] {
        const words = this.listBoardWords(board, orientation);
        const linkedWords: LinkedWordOnBoard[] = [];
        for (let i = 0; i < words.length; i++) {
            let remainingSpaces = RACK_MAX_CAPACITY;
            const word: string[] = [];
            for (let j = i; j + 1 < words.length; j++) {
                const isWordAligned =
                    this.reverseCoordForPosition(words[j + 1].position, orientation).coordH ===
                    this.reverseCoordForPosition(words[j].position, orientation).coordH;

                const spaceBetween =
                    this.reverseCoordForPosition(words[j + 1].position, orientation).coordV -
                    this.reverseCoordForPosition(words[j].position, orientation).coordV -
                    words[j].word.length;

                if (isWordAligned && spaceBetween <= remainingSpaces) {
                    remainingSpaces -= spaceBetween;
                    word.push(...Array(spaceBetween).fill(''));
                    word.push(words[j + 1].word);
                } else break;
            }
            linkedWords.push({ ...words[i], linkedWords: word });
        }
        return linkedWords;
    }

    private reverseCoordForPosition(position: Position, orientation: Orientation): Position {
        if (orientation === Orientation.Horizontal) {
            return { coordH: position.coordV, coordV: position.coordH };
        }
        return position;
    }

    private mergeHorizontalVertical(horizontal: LinkedWordOnBoard[], vertical: LinkedWordOnBoard[]): LinkedWordOnBoard[] {
        const wordList: LinkedWordOnBoard[] = [];
        if (horizontal.length > vertical.length) {
            return this.mergeHorizontalVertical(vertical, horizontal);
        } else {
            for (let i = 0; i < horizontal.length; i++) {
                wordList.push(horizontal[i]);
                wordList.push(vertical[i]);
            }
            for (let i = horizontal.length; i < vertical.length; i++) {
                wordList.push(vertical[i]);
            }
            return wordList;
        }
    }

    private isLastLetterInWord(board: Board, position: Position, orientation: Orientation): boolean {
        const iterator = new PlacementIterator(BASIC_COMMAND, board);
        iterator.setOrientation(orientation);
        iterator.setPosition(position);
        if (iterator.getCoord() === MAX_BOARD_WIDTH) return true;
        if (iterator.getDirectionalNeighbor(position, board) === '') return true;
        return false;
    }
}
