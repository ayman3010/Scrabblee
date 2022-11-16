import { Tools } from '@app/classes/tools/tools';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-virtual-player.service';
import { BoardWordsService } from '@app/services/board-words/board-words.service';
import { CommandHandlerService } from '@app/services/command-handler/command-handler.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { RackService } from '@app/services/rack/rack.service';
import { StringManipulationService } from '@app/services/string-manipulation/string-manipulation.service';
import { DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
import { CommandType } from '@common/enums/enums';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Board, Letter } from '@common/interfaces/board-interface';
import { Command, ExchangeCommand, PlaceCommand, ValidCommand } from '@common/interfaces/command-interface';
import { Rack } from '@common/interfaces/rack-interface';
import { Service } from 'typedi';

export const BOARD_WORD_MARKER = '`';
export const MAX_HINTS = 3;
export const MAX_PROBABILITY = 10;
export const EASY_POINTS_PROBABILITY = 3;
export const MEDIUM_POINTS_PROBABILITY = 6;

export const SKIP_PROBABILITY = 1;
export const EXCHANGE_PROBABILITY = 2;

export const CHARACTER_TRANSFORMATION = 97;

export const EASY_PLAYER_FIRST_RANGE_MIN = 1;
export const EASY_PLAYER_SECOND_RANGE_MIN = 7;
export const EASY_PLAYER_THIRD_RANGE_MIN = 12;

const MAX_VIRTUAL_PLAYER_TURN_DURATION = 20000;

@Service()
export class VirtualPlayerService {
    private readonly maxVirtualPlayerTurnDuration = MAX_VIRTUAL_PLAYER_TURN_DURATION;

    constructor(
        private commandHandler: CommandHandlerService,
        private gameManager: GameManagerService,
        private rackService: RackService,
        private stringManipulation: StringManipulationService,
        private boardWordsService: BoardWordsService,
        private adminVirtualPlayerService: AdminVirtualPlayerService,
    ) {}

    async getVirtualPlayerName(hostName: string, aIDifficulty: AiDifficulty): Promise<string> {
        let list: VirtualPlayer[] = [];
        const virtualPlayer = await this.adminVirtualPlayerService
            .getVirtualPlayers(aIDifficulty)
            .then((virtualPlayers: VirtualPlayer[]) => {
                list = virtualPlayers;
                let guestName = list[Tools.generateRandom(list.length)].name;
                while (guestName === hostName) {
                    guestName = list[Tools.generateRandom(list.length)].name;
                }
                return guestName;
            })
            .catch(() => {
                return 'Quandale Dingles';
            });
        return virtualPlayer;
    }

    async getVirtualPlayerCommand(board: Board, rack: Rack, aiDifficulty: AiDifficulty, nbOfLettersInReserve: number): Promise<Command> {
        if (aiDifficulty === AiDifficulty.EXPERT) return await this.getExpertVirtualPlayerCommand(board, rack, nbOfLettersInReserve);
        return this.getEasyVirtualPlayerCommand(board, rack);
    }

    async getExpertVirtualPlayerCommand(board: Board, rack: Rack, nbOfLettersInReserve: number): Promise<Command> {
        return new Promise((res) => {
            const passOnTimeout = setTimeout(() => {
                res({ commandType: CommandType.Pass, senderName: 'virtualPlayer' });
            }, this.maxVirtualPlayerTurnDuration);
            const validCommands = this.generateValidCommands(board, this.rackService.toString(rack).toLocaleLowerCase());
            clearTimeout(passOnTimeout);
            if (!validCommands.length) {
                res(
                    nbOfLettersInReserve
                        ? ({
                              commandType: CommandType.Exchange,
                              senderName: 'virtualPlayer',
                              letters: this.getRandomLettersFromRack(rack.content, nbOfLettersInReserve),
                          } as Command)
                        : { commandType: CommandType.Pass, senderName: 'virtualPlayer' },
                );
            }
            res(validCommands[validCommands.length - 1].command);
        });
    }

    getEasyVirtualPlayerCommand(board: Board, rack: Rack): Command {
        const probability = Tools.generateRandom(MAX_PROBABILITY);
        if (probability < SKIP_PROBABILITY) {
            return { commandType: CommandType.Pass, senderName: 'virtualPlayer' };
        }
        const exchangeCommand: ExchangeCommand = this.getExchangeCommand(rack);
        if (probability < EXCHANGE_PROBABILITY) {
            return exchangeCommand;
        }
        const placeCommand: PlaceCommand = this.getVirtualPlayerPlacement(board, this.rackService.toString(rack).toLocaleLowerCase());
        if (placeCommand.lettersToPlace === '') {
            return exchangeCommand;
        }
        return placeCommand;
    }

    generateHints(board: Board, rack: Rack): string[] {
        const commandsInline: string[] = [];
        const boardWords = this.boardWordsService.listWordsOnboard(board);
        let points = 0;
        for (const boardWord of boardWords.values()) {
            for (const word of this.generateWordCombinations(
                this.rackService.toString(rack).toLocaleLowerCase(),
                [boardWord.word, ...boardWord.linkedWords],
                board.dictionaryId,
            ).values()) {
                const command = { ...this.commandHandler.generatePlaceCommand(boardWord, word) };
                points = this.gameManager.verifyPlacement(command, board);
                if (points > 0) {
                    commandsInline.push(this.hintMessage({ ...command }, this.stringManipulation.joinString(word), points));
                }
            }
        }
        return this.selectHints(commandsInline);
    }

    private getCommandByPoints(board: Board, wrack: string, points: number): PlaceCommand {
        const validCommands = this.generateValidCommands(board, wrack);
        if (!validCommands.length) return DEFAULT_PLACE_COMMAND;

        for (const command of validCommands) {
            if (command.points >= points) {
                return command.command;
            }
        }
        return validCommands[validCommands.length - 1].command;
    }

    private getVirtualPlayerPlacement(board: Board, rack: string): PlaceCommand {
        const probability = Tools.generateRandom(MAX_PROBABILITY);
        if (probability < EASY_POINTS_PROBABILITY) {
            return this.getCommandByPoints(board, rack, EASY_PLAYER_FIRST_RANGE_MIN);
        }
        if (probability < MEDIUM_POINTS_PROBABILITY) {
            return this.getCommandByPoints(board, rack, EASY_PLAYER_SECOND_RANGE_MIN);
        }
        return this.getCommandByPoints(board, rack, EASY_PLAYER_THIRD_RANGE_MIN);
    }

    private getExchangeCommand(rack: Rack): ExchangeCommand {
        const rackCombinations = this.stringManipulation.generateCombinations(this.rackService.toString(rack).toLocaleLowerCase());
        const exchangeLettersIndex = Tools.generateRandom(rackCombinations.length - 1);
        return {
            commandType: CommandType.Exchange,
            senderName: 'virtualPlayer',
            letters: rackCombinations[exchangeLettersIndex],
        };
    }

    private selectHints(commandsInline: string[]): string[] {
        const hints: string[] = [];
        let nbHints = MAX_HINTS;
        if (commandsInline.length === 0) {
            hints.push(" Aucun indice n'a été trouvé");
            return hints;
        }
        if (commandsInline.length < MAX_HINTS) {
            nbHints = commandsInline.length;
            hints.push('indices disponibles : ' + nbHints);
        }
        for (let i = 0; i < nbHints; i++) {
            hints.push(commandsInline[Tools.generateRandom(commandsInline.length)]);
        }
        return hints;
    }

    private generateValidCommands(board: Board, rack: string): ValidCommand[] {
        const validCommands: ValidCommand[] = [];
        const boardWords = this.boardWordsService.listWordsOnboard(board);
        let points = 0;
        for (const boardWord of boardWords) {
            for (const word of this.generateWordCombinations(rack, [boardWord.word, ...boardWord.linkedWords], board.dictionaryId).values()) {
                const command = { ...this.commandHandler.generatePlaceCommand(boardWord, word) };
                points = this.gameManager.verifyPlacement(command, board);
                if (points > 0) {
                    validCommands.push({ command: { ...command }, points });
                }
            }
        }
        return this.sortbyPoints(validCommands);
    }

    private sortbyPoints(validCommands: ValidCommand[]): ValidCommand[] {
        return validCommands.sort((a, b) => {
            return a.points - b.points;
        });
    }

    private hintMessage(command: PlaceCommand, word: string, points: number): string {
        return word + '\n' + 'Commande: ' + this.commandHandler.convertPlaceCommandIntoString(command) + '\n' + 'Points: ' + points;
    }

    private generateWordCombinations(rack: string, wordOnboard: string[], dictionaryId: string): string[][] {
        const rackCombinations: string[] = this.stringManipulation.generateCombinations(rack);
        const permutationArray: string[][] = [];
        const bonusReplacement = this.stringManipulation.replaceBonus();
        for (const combination of rackCombinations.values()) {
            const possibleWord: string[] = this.stringManipulation.splitString(combination, bonusReplacement);
            const boardWords = this.addBoardWordMarker(wordOnboard);
            this.stringManipulation.permute(possibleWord, permutationArray, dictionaryId, boardWords);
        }
        return permutationArray;
    }

    private addBoardWordMarker(words: string[]): string[] {
        const wordsWithMarker: string[] = [];
        for (const word of words) {
            wordsWithMarker.push(word ? word + BOARD_WORD_MARKER : word);
        }
        return wordsWithMarker;
    }

    private getRandomLettersFromRack(rack: Letter[], quantity: number): string {
        const letterIndexes = Tools.generateMultipleRandom(rack.length, quantity, true);
        let randomLetterList = '';
        for (const letterIndex of letterIndexes) randomLetterList += rack[letterIndex].letter;
        return randomLetterList.toLowerCase();
    }
}
