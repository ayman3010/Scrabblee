import { NO_LETTER, NO_POINTS } from '@app/classes/constants/board-constant';
import { BINGO_BONUS_POINT } from '@app/classes/constants/game-manager-constant';
import { RACK_MAX_CAPACITY } from '@app/classes/constants/rack-constant';
import { Room } from '@app/classes/interfaces/room';
import { BoardPlacementService } from '@app/services/board-placement/board-placement.service';
import { BoardWordsService } from '@app/services/board-words/board-words.service';
import { BoardService } from '@app/services/board/board.service';
import { CommandHandlerService } from '@app/services/command-handler/command-handler.service';
import { ObjectivesGeneratorService } from '@app/services/objectives-generator/objectives-generator.service';
import { PointCalculationService } from '@app/services/point-calculation/point-calculation.service';
import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { MAX_NB_SKIPPED_TURNS } from '@common/constants/game-options-constants';
import { BONUS_LETTER, MINIMUM_LETTERS_FOR_EXCHANGE, NO_LETTER_LEFT } from '@common/constants/reserve-constant';
import { GameState, GameType } from '@common/enums/enums';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Board, WordOnBoard } from '@common/interfaces/board-interface';
import { PlaceCommand, ValidCommand } from '@common/interfaces/command-interface';
import { Player } from '@common/interfaces/player';
import { Rack } from '@common/interfaces/rack-interface';
import { Subject } from 'rxjs';
import { Service } from 'typedi';

@Service()
export class GameManagerService {
    constructor(
        private reserveService: ReserveService,
        private boardPlacement: BoardPlacementService,
        private rackService: RackService,
        private pointCalculation: PointCalculationService,
        private commandHandler: CommandHandlerService,
        private boardWordsService: BoardWordsService,
        private objectivesGenerator: ObjectivesGeneratorService,
    ) {}

    isHostPlayerTurn(room: Room): boolean {
        return room.hostPlayer.isTurn;
    }

    exchangeLetters(room: Room, letterToRemove: string): boolean {
        if (!this.canExpertVirtualPlayerExchange(room) && room.reserve.nbOfLetters < MINIMUM_LETTERS_FOR_EXCHANGE) return false;
        if (this.areLettersInRack(letterToRemove, room)) {
            this.removeLettersFromRack(letterToRemove, room);
            this.reserveService.addToReserve(letterToRemove.toUpperCase(), room.reserve);
            if (room.exchangeEvent.observed) room.exchangeEvent.next(letterToRemove);
            return true;
        }
        return false;
    }

    initializeRoom(room: Room): void {
        room.nbSkippedTurns = 0;
        room.nbOfTurns = 0;
        room.hostPlayer.isTurn = true;
        room.guestPlayer.isTurn = false;
        room.hostPlayer.points = 0;
        room.guestPlayer.points = 0;
        room.reserve = this.reserveService.createReserve();
        room.board = BoardService.createBoard();
        room.board.dictionaryId = room.gameOptions.dictionary.id;

        room.gameState = GameState.GameAccepted;
        room.timer = room.gameOptions.turnDuration;
        room.dateBegin = new Date();
        room.drawEvent = new Subject<void>();
        room.skipEvent = new Subject<void>();
        room.exchangeEvent = new Subject<string>();
        room.placeEvent = new Subject<ValidCommand>();
        room.boardWordsEvent = new Subject<WordOnBoard[]>();

        this.fillPlayerRack(room, room.hostPlayer.rack);
        this.fillPlayerRack(room, room.guestPlayer.rack);

        room.objectives = [];
        if (room.gameOptions.gameType === GameType.LOG2990) this.objectivesGenerator.generateAllObjectives(room);
    }

    endGamePointsUpdate(room: Room): void {
        let guestRackPoints = NO_POINTS;
        let hostRackPoints = NO_POINTS;
        for (let i = 0; i < RACK_MAX_CAPACITY; i++) {
            guestRackPoints += room.guestPlayer.rack.content[i]?.value ?? NO_POINTS;
            hostRackPoints += room.hostPlayer.rack.content[i]?.value ?? NO_POINTS;
        }
        room.hostPlayer.points += this.rackService.isEmpty(room.hostPlayer.rack) ? guestRackPoints : -hostRackPoints;
        room.guestPlayer.points += this.rackService.isEmpty(room.guestPlayer.rack) ? hostRackPoints : -guestRackPoints;
    }

    gameHasToEnd(room: Room): boolean {
        const isReserveEmpty = room.reserve.nbOfLetters === NO_LETTER_LEFT;
        const isRackEmpty = this.rackService.isEmpty(room.hostPlayer.rack) || this.rackService.isEmpty(room.guestPlayer.rack);
        const isMaxSkippedTurns = room.nbSkippedTurns >= MAX_NB_SKIPPED_TURNS;
        return (isRackEmpty && isReserveEmpty) || isMaxSkippedTurns;
    }

    playTurn(command: PlaceCommand, room: Room): void {
        room.board.placementAchieved = false;
        const commandCopy: PlaceCommand = this.commandHandler.deepCopyCommand(command);
        if (!this.areLettersInRack(command.lettersToPlace, room)) return;
        const placedLettersPositions = this.boardPlacement.placeLetters(commandCopy, this.isFirstValidTurn(room.board), room.board);
        if (!room.board.placementAchieved) {
            this.boardPlacement.removeLetters(commandCopy, room.board, placedLettersPositions);
            return;
        }
        this.removeLettersFromRack(commandCopy.lettersToPlace, room);
        const pointsGenerated = this.pointsForTurn(commandCopy, room.board);

        if (room.placeEvent.observed) room.placeEvent.next({ command, points: pointsGenerated });
        this.boardPlacement.removeChecksAndBonuses(commandCopy, room.board, placedLettersPositions);
        if (room.boardWordsEvent.observed) room.boardWordsEvent.next(this.boardWordsService.listWordsOnboard(room.board));
        this.assignPoints(pointsGenerated, room);
    }

    verifyPlacement(command: PlaceCommand, board: Board): number {
        const previousBoard = BoardService.copyBoard(board);
        previousBoard.placementAchieved = false;
        const commandCopy: PlaceCommand = this.commandHandler.deepCopyCommand(command);
        if (!this.commandHandler.isLegalCommand(commandCopy)) return 0;
        const placedLettersPositions = this.boardPlacement.placeLetters(commandCopy, this.isFirstValidTurn(previousBoard), previousBoard);
        if (!previousBoard.placementAchieved) {
            this.boardPlacement.removeLetters(commandCopy, previousBoard, placedLettersPositions);
            return 0;
        }
        const points = this.pointsForCommand(commandCopy, previousBoard);
        return points;
    }

    nextTurnInitialization(room: Room): void {
        if (this.gameHasToEnd(room)) {
            this.endGamePointsUpdate(room);
            room.gameState = GameState.GameOver;
            return;
        }
        this.fillRacks(room);
        this.incrementTurn(room);
        room.guestPlayer.isTurn = !room.guestPlayer.isTurn;
        room.hostPlayer.isTurn = !room.hostPlayer.isTurn;
        room.timer = room.gameOptions.turnDuration;
    }

    finalGameResults(room: Room): string {
        let results = 'Fin de partie - ' + this.reserveService.toString(room.reserve) + '\n';
        results += this.getPlayerResultsString(room.hostPlayer);
        results += this.getPlayerResultsString(room.guestPlayer);
        return results;
    }

    private pointsForTurn(command: PlaceCommand, board: Board): number {
        let points = this.pointCalculation.calculatePoints(command, board);
        points += this.getBingoPoints(command.lettersToPlace);
        return points;
    }

    private pointsForCommand(command: PlaceCommand, board: Board): number {
        let points = this.pointCalculation.calculatePossiblePoints(command, board);
        points += this.getBingoPoints(command.lettersToPlace);
        return points;
    }

    private isFirstValidTurn(board: Board): boolean {
        return JSON.stringify(BoardService.emptyBoard.content) === JSON.stringify(board.content);
    }

    private assignPoints(points: number, room: Room): void {
        if (this.isHostPlayerTurn(room)) {
            room.hostPlayer.points += points;
        } else {
            room.guestPlayer.points += points;
        }
    }

    private getBingoPoints(lettersToPlace: string): number {
        let bonusPoints = NO_POINTS;
        if (lettersToPlace.length === RACK_MAX_CAPACITY) {
            bonusPoints = BINGO_BONUS_POINT;
        }
        return bonusPoints;
    }

    private fillRacks(room: Room): void {
        if (this.isHostPlayerTurn(room)) {
            this.fillPlayerRack(room, room.hostPlayer.rack);
        } else {
            this.fillPlayerRack(room, room.guestPlayer.rack);
        }
    }

    private fillPlayerRack(room: Room, playerRack: Rack): void {
        if (this.rackService.isFull(playerRack)) {
            return;
        }
        while (this.rackService.size(playerRack) < RACK_MAX_CAPACITY && room.reserve.nbOfLetters > NO_LETTER_LEFT) {
            const letterDrawn = this.reserveService.drawLetter(room.reserve);
            if (room.drawEvent.observed) room.drawEvent.next();
            this.rackService.addLetters(letterDrawn, playerRack);
        }
    }

    private removeLettersFromRack(lettersToRemove: string, room: Room): void {
        if (this.isHostPlayerTurn(room)) {
            this.rackService.removeLetters(lettersToRemove, room.hostPlayer.rack);
        } else {
            this.rackService.removeLetters(lettersToRemove, room.guestPlayer.rack);
        }
    }

    private incrementTurn(room: Room): void {
        room.nbOfTurns++;
    }

    private areLettersInRack(lettersToPlace: string, room: Room): boolean {
        let lettersToCheck = NO_LETTER;
        for (const letter of lettersToPlace) {
            if (letter === letter.toUpperCase()) {
                lettersToCheck += BONUS_LETTER;
            } else {
                lettersToCheck += letter.toUpperCase();
            }
        }
        return this.isHostPlayerTurn(room)
            ? this.rackService.containsLetters(lettersToCheck, room.hostPlayer.rack)
            : this.rackService.containsLetters(lettersToCheck, room.guestPlayer.rack);
    }

    private getPlayerResultsString(player: Player): string {
        const playerRack = this.rackService.toString(player.rack);
        return player.name + ' : ' + playerRack + '\n';
    }

    private canExpertVirtualPlayerExchange(room: Room): boolean {
        return room.gameOptions.aiDifficulty === AiDifficulty.EXPERT && room.guestPlayer.isTurn && room.reserve.nbOfLetters > 0;
    }
}
