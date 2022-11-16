import { WordValidationService } from '@app/services/word-validation/word-validation.service';
import { BONUS_LETTER } from '@common/constants/reserve-constant';
import { Service } from 'typedi';

const BOARD_WORD_MARKER = '`';

const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];

@Service()
export class StringManipulationService {
    constructor(private wordValidation: WordValidationService) {}

    // reference :  https://stackoverflow.com/questions/9960908/permutations-in-javascript
    permute(word: string[], permutationArray: string[][], dictionaryTitle: string, boardWords: string[] = [], usedChars: string[] = []): void {
        let character;
        for (let i = 0; i < word.length; i++) {
            if (word.indexOf(word[i]) !== i) continue;

            character = word.splice(i, 1)[0];
            usedChars.push(character);

            if (word.length === 0) {
                const newWords = this.generateBoardCombinations(boardWords, usedChars);
                for (const newWord of newWords) {
                    if (this.wordValidation.inDictionary(dictionaryTitle, this.joinString(newWord))) permutationArray.push(newWord);
                }
            }
            this.permute(word, permutationArray, dictionaryTitle, boardWords, usedChars);

            word.splice(i, 0, character);
            usedChars.pop();
        }
    }

    generateBoardCombinations(boardWords: string[], word: string[]): string[][] {
        if (boardWords.length === 0 || !boardWords[0]) return [word.slice()];

        const possibleWords = [];
        for (let i = 0; i <= word.length; i++) {
            const newWord = word.slice(0, i);
            let currentIndex = i;
            for (const boardWord of boardWords) {
                if (boardWord) newWord.push(boardWord);
                else if (currentIndex < word.length) newWord.push(word[currentIndex++]);
                else break;
            }
            newWord.push(...word.slice(currentIndex, word.length));
            possibleWords.push(newWord);
        }
        return possibleWords;
    }

    generateCombinations(word: string): string[] {
        const combinations: string[] = [];
        for (let i = 0; i < word.length; i++) {
            for (let j = i + 1; j < word.length + 1; j++) {
                if (!combinations.includes(word.slice(i, j))) {
                    combinations.push(word.slice(i, j));
                }
            }
        }
        return combinations;
    }

    joinString(wordInArray: string[]): string {
        let word = '';
        for (const element of wordInArray.values()) {
            if (element.includes(BOARD_WORD_MARKER) || element.includes(BONUS_LETTER)) {
                word += element.substr(0, element.length - 1);
            } else {
                word += element;
            }
        }
        return word;
    }

    splitString(rack: string, replacement: string): string[] {
        const newRack = rack.split('');
        for (let i = 0; i < newRack.length; i++) {
            if (newRack[i] === BONUS_LETTER) {
                newRack[i] = replacement + BONUS_LETTER;
            }
        }
        return newRack;
    }

    replaceBonus(): string {
        return VOWELS[Math.floor(Math.random() * VOWELS.length)];
    }
}
