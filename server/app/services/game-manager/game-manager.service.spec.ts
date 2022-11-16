/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { NO_LETTER, NO_POINTS } from '@app/classes/constants/board-constant';
import { BINGO_BONUS_POINT } from '@app/classes/constants/game-manager-constant';
import { EMPTY_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { BoardPlacementService } from '@app/services/board-placement/board-placement.service';
import { BoardWordsService } from '@app/services/board-words/board-words.service';
import { BoardService } from '@app/services/board/board.service';
import { CommandHandlerService } from '@app/services/command-handler/command-handler.service';
import { ObjectivesGeneratorService } from '@app/services/objectives-generator/objectives-generator.service';
import { PointCalculationService } from '@app/services/point-calculation/point-calculation.service';
import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { WordValidationService } from '@app/services/word-validation/word-validation.service';
import { MAX_NB_SKIPPED_TURNS } from '@common/constants/game-options-constants';
import { BONUS_LETTER, INITIAL_RESERVE_CONTENT, MINIMUM_LETTERS_FOR_EXCHANGE, NO_LETTER_LEFT } from '@common/constants/reserve-constant';
import { CommandType, GameState, GameType, Orientation } from '@common/enums/enums';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { WordOnBoard } from '@common/interfaces/board-interface';
import { PlaceCommand, ValidCommand } from '@common/interfaces/command-interface';
import { Rack } from '@common/interfaces/rack-interface';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { GameManagerService } from './game-manager.service';

describe('GameManagerService Tests', () => {
    let service: GameManagerService;
    let commandHandler: CommandHandlerService;
    let wordValidationServiceStub: sinon.SinonStubbedInstance<WordValidationService>;
    let boardWordsService: sinon.SinonStubbedInstance<BoardWordsService>;
    let objectivesGenerator: sinon.SinonStubbedInstance<ObjectivesGeneratorService>;
    let boardService: BoardService;
    let pointCalculationService: PointCalculationService;
    let boardPlacement: BoardPlacementService;
    let room: Room;

    let reserveService: ReserveService;
    let rackService: RackService;
    let emptyRack: Rack;

    beforeEach(() => {
        sinon.restore();

        wordValidationServiceStub = sinon.createStubInstance(WordValidationService);
        wordValidationServiceStub.inDictionary.returns(true);

        boardService = new BoardService(wordValidationServiceStub as any as WordValidationService);
        pointCalculationService = new PointCalculationService(boardService);
        boardPlacement = new BoardPlacementService(boardService);
        boardWordsService = sinon.createStubInstance(BoardWordsService);
        objectivesGenerator = sinon.createStubInstance(ObjectivesGeneratorService);

        room = JSON.parse(JSON.stringify(EMPTY_ROOM));

        emptyRack = { content: [] };
        reserveService = new ReserveService();
        rackService = new RackService();
        commandHandler = new CommandHandlerService();
        service = new GameManagerService(
            reserveService,
            boardPlacement,
            rackService,
            pointCalculationService,
            commandHandler,
            boardWordsService as unknown as BoardWordsService,
            objectivesGenerator as unknown as ObjectivesGeneratorService,
        );
        boardWordsService.listWordsOnboard.returns([]);
        service.initializeRoom(room);
    });

    it('Once the room is initialized their should be 88 letters in the reserve and both players should have seven letters in their rack', () => {
        const reserveAfterStart = 88;
        expect(room.reserve.nbOfLetters).equal(reserveAfterStart);
        expect(rackService.isFull(room.hostPlayer.rack)).equal(true);
        expect(rackService.isFull(room.guestPlayer.rack)).equal(true);
    });

    it('initializeRoom should call generateAllObjectives if gameType is LOG2990', () => {
        const newRoom: Room = JSON.parse(JSON.stringify(EMPTY_ROOM));
        newRoom.gameOptions.gameType = GameType.LOG2990;
        service.initializeRoom(newRoom);
        expect(objectivesGenerator.generateAllObjectives.called).equal(true);
    });

    it('a player who wants to place letters that are not in his rack should not increment the number of turns', () => {
        room.hostPlayer.rack.content = [{ letter: 'a', value: 1 }];
        room.guestPlayer.rack.content = [{ letter: 'a', value: 1 }];
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rat',

            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        const secondPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rat',

            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.playTurn(firstPlaceCommand, room);
        expect(room.nbOfTurns).equal(0);
        service.playTurn(secondPlaceCommand, room);
        expect(room.nbOfTurns).equal(0);
    });

    it('a player who wants to place letters that are not in his rack should not change his rack even if it contains some of the letters', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rat',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,

            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [{ letter: 'A', value: 1 }];
        room.hostPlayer.isTurn = true;
        service.playTurn(firstPlaceCommand, room);
        expect(rackService['containsLetters']('A', room.hostPlayer.rack)).equal(true);
        expect(rackService.size(room.hostPlayer.rack)).equal(1);
    });

    it('a player who places letters, should no longer have them in his rack', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rat',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,

            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [
            { letter: 'r', value: 1 },
            { letter: 'a', value: 1 },
            { letter: 't', value: 1 },
            { letter: 'l', value: 1 },
            { letter: 'n', value: 1 },
            { letter: 'h', value: 1 },
            { letter: 'g', value: 1 },
        ];
        sinon.stub(rackService, 'isFull').returns(true);
        service.playTurn(firstPlaceCommand, room);
        expect(rackService.containsLetters('lnhg', room.hostPlayer.rack)).equal(true);
        expect(rackService.size(room.hostPlayer.rack)).equal(7);
    });

    it('A valid placement should be able to be placed, a second placement at that \
position should not work and change the letter at that position', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rat',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        const secondPlaceCommand: PlaceCommand = {
            lettersToPlace: 'cle',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [
            { letter: 'R', value: 1 },
            { letter: 'A', value: 1 },
            { letter: 'T', value: 1 },
            { letter: 'L', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.guestPlayer.rack.content = [
            { letter: 'C', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'T', value: 1 },
            { letter: 'L', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.hostPlayer.isTurn = true;
        service.playTurn(firstPlaceCommand, room);
        service.playTurn(secondPlaceCommand, room);
        expect(room.board.content[7][7].tile.letter).equal('r');
    });

    it('each player turn should return the right amount of points 2 turn game', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'chat',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        const secondPlaceCommand: PlaceCommand = {
            lettersToPlace: 'hon',

            placement: { coordH: 10, coordV: 8 },
            orientation: Orientation.Vertical,
            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [
            { letter: 'C', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'A', value: 1 },
            { letter: 'T', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.guestPlayer.rack.content = [
            { letter: 'H', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'L', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        const pointP1 = 18;
        const pointP2 = 14;
        room.hostPlayer.isTurn = true;
        service.playTurn(firstPlaceCommand, room);
        expect(room.hostPlayer.points).equal(pointP1);
        service.nextTurnInitialization(room);
        service.playTurn(secondPlaceCommand, room);
        expect(room.guestPlayer.points).equal(pointP2);
    });

    it('each player turn should return the right amount of points', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'chat',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,

            commandType: CommandType.Place,
            senderName: '',
        };
        const secondPlaceCommand: PlaceCommand = {
            lettersToPlace: 'hon',

            placement: { coordH: 10, coordV: 8 },
            orientation: Orientation.Vertical,
            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [
            { letter: 'C', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'A', value: 1 },
            { letter: 'T', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.guestPlayer.rack.content = [
            { letter: 'H', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'L', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        const pointP1 = 18;
        const pointP2 = 14;
        service.playTurn(firstPlaceCommand, room);
        expect(room.hostPlayer.points).equal(pointP1);
        service.nextTurnInitialization(room);
        service.playTurn(secondPlaceCommand, room);
        expect(room.guestPlayer.points).equal(pointP2);
    });

    it('each player turn should return the right amount of points for a 3 turn game', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'chien',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        const secondPlaceCommand: PlaceCommand = {
            lettersToPlace: 'tre',

            placement: { coordH: 9, coordV: 6 },
            orientation: Orientation.Vertical,
            commandType: CommandType.Place,
            senderName: '',
        };
        const thirdPlaceCommand: PlaceCommand = {
            lettersToPlace: 'riche',
            placement: { coordH: 9, coordV: 10 },
            orientation: Orientation.Horizontal,

            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [
            { letter: 'C', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'I', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.guestPlayer.rack.content = [
            { letter: 'T', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'L', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        const pointP1 = 22;
        const pointP2 = 6;
        service.playTurn(firstPlaceCommand, room);
        expect(room.hostPlayer.points).equal(pointP1);
        rackService.addLetters('RICHE', room.hostPlayer.rack);
        service.nextTurnInitialization(room);
        service.playTurn(secondPlaceCommand, room);
        expect(room.guestPlayer.points).equal(pointP2);

        const pointP3 = pointP1 + 25;
        service.nextTurnInitialization(room);
        service.playTurn(thirdPlaceCommand, room);
        expect(room.hostPlayer.points).equal(pointP3);
    });

    it('each player turn should return the right amount of points for a 3 turn game', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rye',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        const secondPlaceCommand: PlaceCommand = {
            lettersToPlace: 'ne',
            placement: { coordH: 8, coordV: 5 },
            orientation: Orientation.Vertical,
            commandType: CommandType.Place,

            senderName: '',
        };
        const thirdPlaceCommand: PlaceCommand = {
            lettersToPlace: 'vie',
            placement: { coordH: 9, coordV: 5 },

            orientation: Orientation.Vertical,
            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [
            { letter: 'R', value: 1 },
            { letter: 'Y', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.guestPlayer.rack.content = [
            { letter: 'T', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'L', value: 1 },
            { letter: 'N', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        const pointP1 = 24;
        const pointP2 = 13;
        service.playTurn(firstPlaceCommand, room);
        expect(room.hostPlayer.points).equal(pointP1);
        rackService.addLetters('VIE', room.hostPlayer.rack);
        service.nextTurnInitialization(room);
        service.playTurn(secondPlaceCommand, room);
        expect(room.guestPlayer.points).equal(pointP2);

        const pointP3 = pointP1;
        service.nextTurnInitialization(room);

        room.board.placementAchieved = false;
        sinon.stub(boardPlacement, 'placeLetters').returns([]);
        service.playTurn(thirdPlaceCommand, room);
        expect(room.hostPlayer.points).equal(pointP3);
    });

    it('A valid placement should be able to be placed and have the right amount of points', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'loupe',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };

        room.hostPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        service.playTurn(firstPlaceCommand, room);
        const calculatedValue = 16;
        expect(room.hostPlayer.points).equal(calculatedValue);
    });

    it('turnInitialization returns false if a player draws and there are no more letters in the reserve', () => {
        room.reserve.nbOfLetters = NO_LETTER_LEFT;
        rackService.initializeRack(room.hostPlayer.rack);
        service.nextTurnInitialization(room);
        expect(rackService.isEmpty(room.hostPlayer.rack)).to.equal(true);
        rackService.initializeRack(room.guestPlayer.rack);
        service.nextTurnInitialization(room);
        expect(rackService.isEmpty(room.guestPlayer.rack)).to.equal(true);
    });

    it('turnInitialization ensures that the rack of the player that just played is full', () => {
        rackService.initializeRack(room.hostPlayer.rack);
        service.nextTurnInitialization(room);
        expect(rackService.isFull(room.hostPlayer.rack)).to.equal(true);
    });

    it('a player who makes a valid placement of 7 letters must receive a bonus of 50 points', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'carabin',

            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Vertical,
            commandType: CommandType.Place,
            senderName: '',
        };
        const expectedPoints = 78;
        room.hostPlayer.rack.content = [
            { letter: 'C', value: 1 },
            { letter: 'A', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'A', value: 1 },
            { letter: 'B', value: 1 },
            { letter: 'I', value: 1 },
            { letter: 'N', value: 1 },
        ];
        service.playTurn(firstPlaceCommand, room);
        expect(room.hostPlayer.points).equal(expectedPoints);
    });

    it('A valid placement should be able to be placed and have the right amount of points, for both players', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'loupe',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        room.hostPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        service.playTurn(firstPlaceCommand, room);
        const calculatedValue = 16;
        expect(room.hostPlayer.points).equal(calculatedValue);
        const secondPlaceCommand: PlaceCommand = {
            lettersToPlace: 'oup',
            placement: { coordV: 8, coordH: 7 },

            orientation: Orientation.Vertical,
            commandType: CommandType.Place,
            senderName: '',
        };
        room.guestPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'H', value: 1 },
            { letter: 'G', value: 1 },
        ];
        const calculatedpointP2 = 6;
        service.nextTurnInitialization(room);
        service.playTurn(secondPlaceCommand, room);
        expect(room.guestPlayer.points).equal(calculatedpointP2);
    });

    it('if a player exchanges letters that are on his rack he will receive new letters', () => {
        const letters = 'louperl';
        room.hostPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'L', value: 1 },
        ];
        service.exchangeLetters(room, letters);
        expect(room.hostPlayer.rack).not.equal(letters);
        const lettersP2 = 'abcdefg';
        room.guestPlayer.rack.content = [
            { letter: 'A', value: 1 },
            { letter: 'B', value: 1 },
            { letter: 'C', value: 1 },
            { letter: 'D', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'F', value: 1 },
            { letter: 'G', value: 1 },
        ];
        service.exchangeLetters(room, lettersP2);
        expect(room.hostPlayer.rack).not.equal(lettersP2);
    });

    it('if a player exchanges letters that are on his rack, exchangeLetters should return true', () => {
        const letters = 'louperl';
        room.hostPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'L', value: 1 },
        ];
        const result = service.exchangeLetters(room, letters);
        expect(room.hostPlayer.rack).not.equal(letters);
        expect(result).equal(true);
    });

    it('exchangeLetters should call next of exchangeEvent if letters are in rack', () => {
        const letters = 'louperl';
        room.hostPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'L', value: 1 },
        ];
        const stub = sinon.createStubInstance(Subject);
        room.exchangeEvent = stub as unknown as Subject<string>;
        Object.defineProperty(stub, 'observed', {
            get() {
                return true;
            },
        });
        service.exchangeLetters(room, letters);
        expect(stub.next.called).equal(true);
    });

    it('if a player exchanges letters that are not on his rack he will not receive new letters', () => {
        const lettersToChange = 'ghj';
        room.hostPlayer.rack = {
            content: [
                { letter: 'L', value: 1 },
                { letter: 'O', value: 1 },
                { letter: 'U', value: 1 },
                { letter: 'P', value: 1 },
                { letter: 'E', value: 1 },
                { letter: 'R', value: 1 },
                { letter: 'L', value: 1 },
            ],
        };
        service.exchangeLetters(room, lettersToChange);
        expect(rackService.containsLetters('LOUPERL', room.hostPlayer.rack)).equal(true);
    });

    it('if a player exchanges letters that are not on his rack he will not receive new letters and exchangeLetters should return false', () => {
        const myRack = 'LOUPERLR';
        const lettersToChange = 'ghj';
        rackService.addLetters(myRack, room.hostPlayer.rack);
        const result = service.exchangeLetters(room, lettersToChange);
        expect(result).equal(false);
    });

    it('if a player exchanges letters and it is not his turn, his rack should not change', () => {
        room.hostPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'L', value: 1 },
        ];

        room.guestPlayer.isTurn = true;
        room.hostPlayer.isTurn = false;
        service.exchangeLetters(room, 'louperl');
        expect(rackService.containsLetters('LOUPERL', room.hostPlayer.rack)).equal(true);
    });

    it('if a player exchanges letters and the reserve does not have enough letters left, his rack should not \
change and exchangeLetters should return false', () => {
        room.hostPlayer.rack.content = [
            { letter: 'L', value: 1 },
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'P', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'R', value: 1 },
            { letter: 'L', value: 1 },
        ];

        room.guestPlayer.isTurn = false;
        room.hostPlayer.isTurn = true;
        room.reserve = {
            content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })),
            nbOfLetters: MINIMUM_LETTERS_FOR_EXCHANGE - 1,
        };
        const result = service.exchangeLetters(room, 'louperl');
        expect(rackService.containsLetters('LOUPERL', room.hostPlayer.rack)).equal(true);
        expect(result).equal(false);
    });

    it('An invalid placement should return 0 points', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'abcde',
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        rackService.addLetters('abcdefg', room.hostPlayer.rack);
        service.playTurn(firstPlaceCommand, room);
        const calculatedValue = 0;
        expect(room.hostPlayer.points).equal(calculatedValue);
    });

    it('An invalid placement should not increment the number of turns', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'abcde',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,

            commandType: CommandType.Place,
            senderName: '',
        };
        rackService.addLetters('abcdefg', room.hostPlayer.rack);

        const nbOfTurnsBefore = room.nbOfTurns;
        service.playTurn(firstPlaceCommand, room);
        expect(room.nbOfTurns).equal(nbOfTurnsBefore);
    });

    it('assignPoints adds the right number of points to the right player', () => {
        const hostPlayerPoints = 9;
        const guestPlayerPoints = 4;

        service['assignPoints'](hostPlayerPoints, room);
        sinon.stub(service, 'isHostPlayerTurn').returns(false);
        service['assignPoints'](guestPlayerPoints, room);
        expect(room.hostPlayer.points).equal(hostPlayerPoints);
        expect(room.guestPlayer.points).equal(guestPlayerPoints);
    });

    it('areLettersInRack checks the rack of the player who is on his turn and returns true if he has the letters and false otherwise', () => {
        const hostPlayerRack = 'abcdefg';
        const guestPlayerRack = 'hijqksw';
        room.hostPlayer.rack.content = [
            { letter: 'A', value: 1 },
            { letter: 'B', value: 1 },
            { letter: 'C', value: 1 },
            { letter: 'D', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'F', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.guestPlayer.rack.content = [
            { letter: 'H', value: 1 },
            { letter: 'I', value: 1 },
            { letter: 'J', value: 1 },
            { letter: 'Q', value: 1 },
            { letter: 'K', value: 1 },
            { letter: 'S', value: 1 },
            { letter: 'W', value: 1 },
        ];

        expect(service['areLettersInRack'](hostPlayerRack, room)).equal(true);

        expect(service['areLettersInRack'](guestPlayerRack, room)).equal(false);
        service.nextTurnInitialization(room);

        expect(service['areLettersInRack'](hostPlayerRack, room)).equal(false);

        expect(service['areLettersInRack'](guestPlayerRack, room)).equal(true);
    });

    it('removeLettersFromRack removes letters from the rack of the player whose turn it is', () => {
        const expectedHostRack = 'DEFG';
        const expectedGuestRack = 'QKSW';
        room.hostPlayer.rack.content = [
            { letter: 'A', value: 1 },
            { letter: 'B', value: 1 },
            { letter: 'C', value: 1 },
            { letter: 'D', value: 1 },
            { letter: 'E', value: 1 },
            { letter: 'F', value: 1 },
            { letter: 'G', value: 1 },
        ];
        room.guestPlayer.rack.content = [
            { letter: 'H', value: 1 },
            { letter: 'I', value: 1 },
            { letter: 'J', value: 1 },
            { letter: 'Q', value: 1 },
            { letter: 'K', value: 1 },
            { letter: 'S', value: 1 },
            { letter: 'W', value: 1 },
        ];
        const toRemoveHostPlayer = 'abc';
        const toRemoveGuestPlayer = 'hij';
        service['removeLettersFromRack'](toRemoveHostPlayer, room);
        expect(rackService.toString(room.hostPlayer.rack)).equal(expectedHostRack);
        service.nextTurnInitialization(room);

        service['removeLettersFromRack'](toRemoveGuestPlayer, room);

        expect(rackService.toString(room.guestPlayer.rack)).equal(expectedGuestRack);
    });

    it('fillPlayerRack should call next of drawEvent for each drawn letter', () => {
        const rack: Rack = { ...emptyRack };
        rackService.initializeRack(rack);
        const stub = sinon.createStubInstance(Subject);
        room.drawEvent = stub as unknown as Subject<void>;
        Object.defineProperty(stub, 'observed', {
            get() {
                return true;
            },
        });
        service['fillPlayerRack'](room, rack);
        expect(stub.next.callCount).equal(7);
    });

    it('fillPlayerRack fills a rack if the reserve is full', () => {
        const rack: Rack = { ...emptyRack };
        rackService.initializeRack(rack);
        service['fillPlayerRack'](room, rack);
        expect(rackService.isFull(rack)).equal(true);
    });

    it('fillRacks fills the rack of the player whose turn it is', () => {
        room.guestPlayer.rack.content = [];
        room.hostPlayer.rack.content = [];
        service['fillRacks'](room);
        expect(rackService.isFull(room.hostPlayer.rack)).equal(true);
        expect(rackService.isEmpty(room.guestPlayer.rack)).equal(true);
    });

    it('incrementTurn returns to next turn', () => {
        const secondTurn = 1;
        service['incrementTurn'](room);
        expect(room.nbOfTurns).equal(secondTurn);
    });

    it('incrementTurn returns to next turn', () => {
        const expectedPoints = BINGO_BONUS_POINT;
        const placeCommand: PlaceCommand = {
            commandType: CommandType.Place,
            placement: { coordH: 4, coordV: 4 },

            orientation: Orientation.Horizontal,
            lettersToPlace: 'asdfasd',
            senderName: '',
        };
        expect(service['pointsForTurn'](placeCommand, room.board)).equal(expectedPoints);
    });

    it('gameHasToEnd returns true if the reserve and one of the two racks are empty', () => {
        room.guestPlayer.rack.content = [];
        room.reserve.nbOfLetters = NO_LETTER_LEFT;
        expect(service.gameHasToEnd(room)).equal(true);
    });

    it('gameHasToEnd returns false if reserve is empty but both racks are not', () => {
        rackService.addLetters('QOUW', room.hostPlayer.rack);
        rackService.addLetters('ASD', room.guestPlayer.rack);
        room.reserve.nbOfLetters = NO_LETTER_LEFT;
        expect(service.gameHasToEnd(room)).equal(false);
    });

    it('gameHasToEnd return true if 6 rounds have been passed in a row', () => {
        rackService.addLetters('QOUW', room.hostPlayer.rack);
        rackService.addLetters('ASD', room.guestPlayer.rack);
        room.reserve.nbOfLetters = NO_LETTER_LEFT;
        room.nbSkippedTurns = MAX_NB_SKIPPED_TURNS;
        expect(service.gameHasToEnd(room)).equal(true);
    });

    it('endGamePointsUpdate should decrease the points of both players if none of them were out of letters', () => {
        room.hostPlayer.rack.content = [
            { letter: 'A', value: 1 },
            { letter: 'A', value: 1 },
        ];
        room.guestPlayer.rack.content = [{ letter: 'A', value: 1 }];
        room.hostPlayer.points = 10;
        room.guestPlayer.points = 20;
        const expectedPlayerOne = 8;
        const expectedPlayerTwo = 19;
        service.endGamePointsUpdate(room);

        expect(room.hostPlayer.points).to.be.equal(expectedPlayerOne);
        expect(room.guestPlayer.points).to.be.equal(expectedPlayerTwo);
    });

    it('endGamePointsUpdate should decrease the points of player one but increase the points of player two if player two was out of letters', () => {
        room.hostPlayer.rack.content = [
            { letter: 'A', value: 1 },
            { letter: 'A', value: 1 },
        ];
        room.guestPlayer.rack.content = [];
        room.hostPlayer.points = 10;
        room.guestPlayer.points = 20;
        const expectedPlayerOne = 8;
        const expectedPlayerTwo = 22;
        service.endGamePointsUpdate(room);

        expect(room.hostPlayer.points).to.be.equal(expectedPlayerOne);
        expect(room.guestPlayer.points).to.be.equal(expectedPlayerTwo);
    });

    it('endGamePointsUpdate should increase the points of player one but decrease the points of player two if player one was out of letters', () => {
        room.guestPlayer.rack.content = [{ letter: 'A', value: 1 }];
        room.hostPlayer.rack.content = [];
        room.hostPlayer.points = 10;
        room.guestPlayer.points = 20;
        const expectedPlayerOne = 11;
        const expectedPlayerTwo = 19;
        service.endGamePointsUpdate(room);

        expect(room.hostPlayer.points).to.be.equal(expectedPlayerOne);
        expect(room.guestPlayer.points).to.be.equal(expectedPlayerTwo);
    });

    it('areLettersInRack recognizes when a bonus letter is used and checks if it is in the rack', () => {
        room.hostPlayer.rack = {
            content: [
                { letter: 'T', value: 1 },
                { letter: 'H', value: 1 },
                { letter: BONUS_LETTER, value: 0 },
            ],
        };
        const lettersToPlace = 'thE';
        expect(service['areLettersInRack'](lettersToPlace, room)).to.be.equal(true);
    });

    it('playTurn should do nothing if the player makes an invalid placement', () => {
        const placeCommand: PlaceCommand = {
            commandType: CommandType.Place,
            placement: { coordH: 7, coordV: 7 },

            orientation: Orientation.Horizontal,
            lettersToPlace: 'zz',
            senderName: '',
        };
        room.hostPlayer.rack = {
            content: [
                { letter: 'Z', value: 1 },
                { letter: 'Z', value: 1 },
            ],
        };

        room.board.placementAchieved = false;

        sinon.stub(boardPlacement, 'placeLetters').returns([]);
        service.playTurn(placeCommand, room);
        expect(room.board.content[7][7].tile.letter).to.be.equal(NO_LETTER);
        expect(room.guestPlayer.points).to.be.equal(NO_POINTS);
        expect(room.hostPlayer.points).to.be.equal(NO_POINTS);
    });

    it('playTurn should call next of placeEvent if placement successful', () => {
        const placeCommand: PlaceCommand = {
            lettersToPlace: 'loupe',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        sinon.stub(service as any, 'areLettersInRack').returns(true);
        sinon.stub(service as any, 'pointsForTurn').returns(2);
        sinon.stub(service as any, 'removeLettersFromRack');
        sinon.stub(boardPlacement, 'placeLetters').callsFake(() => {
            room.board.placementAchieved = true;
            return [];
        });

        const stub = sinon.createStubInstance(Subject);
        room.placeEvent = stub as unknown as Subject<ValidCommand>;
        Object.defineProperty(stub, 'observed', {
            get() {
                return true;
            },
        });
        service.playTurn(placeCommand, room);
        expect(stub.next.called).equal(true);
    });

    it('playTurn should call next of boardWordsEvent if placement successful', () => {
        const placeCommand: PlaceCommand = {
            lettersToPlace: 'loupe',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        sinon.stub(service as any, 'areLettersInRack').returns(true);
        sinon.stub(service as any, 'pointsForTurn').returns(2);
        sinon.stub(service as any, 'removeLettersFromRack');
        sinon.stub(boardPlacement, 'placeLetters').callsFake(() => {
            room.board.placementAchieved = true;
            return [];
        });

        const stub = sinon.createStubInstance(Subject);
        room.boardWordsEvent = stub as unknown as Subject<WordOnBoard[]>;
        Object.defineProperty(stub, 'observed', {
            get() {
                return true;
            },
        });
        service.playTurn(placeCommand, room);
        expect(stub.next.called).equal(true);
    });

    it("nextTurnInitialization should call gameHasToEnd. If it returns false, it should not call endGamePointsUpdate(), but it should \
call fillRacks() and incrementTurn(), it should swap the isTurn for the players and should not set the room's gameState to GameOver", () => {
        room.hostPlayer.isTurn = true;
        room.guestPlayer.isTurn = false;
        const expectedHostIsTurn = false;
        const expectedGuestIsTurn = true;
        const gameHasToEndStub = sinon.stub(service, 'gameHasToEnd').returns(false);
        const endGamePointsUpdate = sinon.stub(service, 'endGamePointsUpdate');
        const fillRacksStub = sinon.stub(service as any, 'fillRacks');
        const incrementTurnStub = sinon.stub(service as any, 'incrementTurn');

        service.nextTurnInitialization(room);

        expect(gameHasToEndStub.called).equal(true);
        expect(endGamePointsUpdate.called).equal(false);
        expect(fillRacksStub.called).equal(true);
        expect(incrementTurnStub.called).equal(true);
        expect(room.hostPlayer.isTurn).equal(expectedHostIsTurn);
        expect(room.guestPlayer.isTurn).equal(expectedGuestIsTurn);
        expect(room.gameState).not.equal(GameState.GameOver);
    });

    it("nextTurnInitialization should call gameHasToEnd. If it returns true, it should call endGamePointsUpdate(), but it should not \
call fillRacks() or incrementTurn(), it should not swap the isTurn for the players and should set the room's gameState to GameOver", () => {
        room.hostPlayer.isTurn = true;
        room.guestPlayer.isTurn = false;
        const expectedHostIsTurn = true;
        const expectedGuestIsTurn = false;
        const gameHasToEndStub = sinon.stub(service, 'gameHasToEnd').returns(true);
        const endGamePointsUpdate = sinon.stub(service, 'endGamePointsUpdate');
        const fillRacksStub = sinon.stub(service as any, 'fillRacks');
        const incrementTurnStub = sinon.stub(service as any, 'incrementTurn');

        service.nextTurnInitialization(room);

        expect(gameHasToEndStub.called).equal(true);
        expect(endGamePointsUpdate.called).equal(true);
        expect(fillRacksStub.called).equal(false);
        expect(incrementTurnStub.called).equal(false);
        expect(room.hostPlayer.isTurn).equal(expectedHostIsTurn);
        expect(room.guestPlayer.isTurn).equal(expectedGuestIsTurn);
        expect(room.gameState).equal(GameState.GameOver);
    });

    it('finalGameResults should call reserveService.toString with the right argument and getPlayerResultsString() \
twice with the right arguments', () => {
        const getPlayerResultsStringStub = sinon.stub(service as any, 'getPlayerResultsString').returns('');
        const toStringStub = sinon.stub(reserveService, 'toString').returns('');

        service.finalGameResults(room);

        expect(toStringStub.called).equal(true);
        expect(toStringStub.calledWith(room.reserve)).equal(true);
        expect(getPlayerResultsStringStub.calledTwice).equal(true);
        expect(getPlayerResultsStringStub.calledWith(room.hostPlayer)).equal(true);
        expect(getPlayerResultsStringStub.calledWith(room.guestPlayer)).equal(true);
    });

    it('finalGameResults should produce the right results if there is no tie.', () => {
        room.hostPlayer.points = 420;
        room.guestPlayer.points = 69;
        sinon.stub(service as any, 'getPlayerResultsString').returns('');
        sinon.stub(reserveService, 'toString').returns('ABC');
        const expected = 'Fin de partie - ABC\n';

        const result = service.finalGameResults(room);

        expect(result).equal(expected);
    });

    it('finalGameResults should produce the right results if there is a tie.', () => {
        room.hostPlayer.points = 69;
        room.guestPlayer.points = 69;
        sinon.stub(service as any, 'getPlayerResultsString').returns('');
        sinon.stub(reserveService, 'toString').returns('ABC');
        const expected = 'Fin de partie - ABC\n';

        const result = service.finalGameResults(room);

        expect(result).equal(expected);
    });

    it("getPlayerResultsString should call rackService.toString() and return their number of points, \
as well as the content of their rack textually if it's not empty", () => {
        room.hostPlayer.points = 69;
        room.hostPlayer.name = 'John Scrabble';
        const expected = 'John Scrabble : SCRABBL\n';
        const toStringStub = sinon.stub(rackService, 'toString').returns('SCRABBL');

        expect(service['getPlayerResultsString'](room.hostPlayer)).equal(expected);
        expect(toStringStub.called).equal(true);
    });

    it("getPlayerResultsString should call rackService.toString() and return their number of points, \
as well as 'Vide!' if their rack is empty", () => {
        room.hostPlayer.points = 69;
        room.hostPlayer.name = 'John Scrabble';
        const expected = 'John Scrabble : \n';
        const toStringStub = sinon.stub(rackService, 'toString').returns('');

        expect(service['getPlayerResultsString'](room.hostPlayer)).equal(expected);
        expect(toStringStub.called).equal(true);
    });

    it('verifyPlacement should return the points generated by a valid placement', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rat',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,

            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.verifyPlacement(firstPlaceCommand, room.board)).to.equals(6);
    });

    it('verifyPlacement should return 0 points if the command is unsuccessful', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rwz',
            placement: { coordH: 7, coordV: 7 },
            orientation: Orientation.Horizontal,

            commandType: CommandType.Place,
            senderName: '',
        };

        room.board.placementAchieved = false;

        sinon.stub(boardPlacement, 'placeLetters').returns([]);
        expect(service.verifyPlacement(firstPlaceCommand, room.board)).to.equals(NO_POINTS);
    });

    it('verifyPlacement should return 0 points if the command is invalid', () => {
        const firstPlaceCommand: PlaceCommand = {
            lettersToPlace: 'rwz',

            placement: { coordH: 15, coordV: 7 },
            orientation: Orientation.Horizontal,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.verifyPlacement(firstPlaceCommand, room.board)).to.equals(NO_POINTS);
    });

    it('canExpertVirtualPlayerExchange should return false if the AiDifficulty of the room is set to BEGINNER', () => {
        room.gameOptions.aiDifficulty = AiDifficulty.BEGINNER;
        expect(service['canExpertVirtualPlayerExchange'](room)).equal(false);
    });

    it("canExpertVirtualPlayerExchange should return false if the AiDifficulty of the room is set to EXPERT \
but it's not the guest player's turn", () => {
        room.gameOptions.aiDifficulty = AiDifficulty.EXPERT;
        room.guestPlayer.isTurn = false;
        expect(service['canExpertVirtualPlayerExchange'](room)).equal(false);
    });

    it("canExpertVirtualPlayerExchange should return true if the AiDifficulty of the room is set to EXPERT and it is the guest player's turn", () => {
        room.gameOptions.aiDifficulty = AiDifficulty.EXPERT;
        room.guestPlayer.isTurn = true;
        expect(service['canExpertVirtualPlayerExchange'](room)).equal(true);
    });

    it('canExpertVirtualPlayerExchange should return false if there is no more letters in the reserve', () => {
        room.gameOptions.aiDifficulty = AiDifficulty.EXPERT;
        room.guestPlayer.isTurn = true;
        room.reserve.nbOfLetters = 0;
        expect(service['canExpertVirtualPlayerExchange'](room)).equal(false);
    });
});
