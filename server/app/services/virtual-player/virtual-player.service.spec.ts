/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { Tools } from '@app/classes/tools/tools';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-virtual-player.service';
import { BoardWordsService } from '@app/services/board-words/board-words.service';
import { CommandHandlerService } from '@app/services/command-handler/command-handler.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { RackService } from '@app/services/rack/rack.service';
import { StringManipulationService } from '@app/services/string-manipulation/string-manipulation.service';
import { EASY_POINTS_PROBABILITY, MEDIUM_POINTS_PROBABILITY, VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { DEFAULT_VIRTUAL_PLAYERS } from '@common/constants/admin-virtual-player';
import { DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { RESERVE_CAPACITY } from '@common/constants/reserve-constant';
import { EMPTY_BOARD } from '@common/constants/room-constants';
import { Bonus, CommandType, Orientation } from '@common/enums/enums';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Board, Tile, WordOnBoard } from '@common/interfaces/board-interface';
import { PlaceCommand, ValidCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('VirtualPlayerService test', () => {
    let virtualPlayer: VirtualPlayerService;
    let TEST_BOARD: Board;
    let adminVirtualPlayerStub: sinon.SinonStubbedInstance<AdminVirtualPlayerService>;

    const gameManagerServiceMock = {
        verifyPlacement: (command: PlaceCommand, board: Board) => {
            if (command.lettersToPlace === '') return 0;
            return 1;
        },
    };

    const commandHandlerServiceMock = {
        convertPlaceCommandIntoString: () => {
            return 'command';
        },
        generatePlaceCommand: (wordOnBoard: WordOnBoard, potentialWord: string[]) => {
            return {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',

                placement: { coordV: 7, coordH: 7 },
                orientation: Orientation.Horizontal,
            };
        },
    };

    const rackServiceMock = {
        toString: () => {
            return 'abc';
        },
    };

    const stringManipulationServiceMock = {
        generateCombinations: () => {
            return ['a', 'b'];
        },
        replaceBonus: () => {
            return 'A';
        },
        splitString: () => {
            return ['a', 'b'];
        },
        permute: () => {
            return ['a', 'b'];
        },
        joinString: (word: string[]) => {
            return word[0];
        },
    };

    const boardWordsServiceMock = {
        listWordsOnboard: (board: Board) => {
            return [
                {
                    position: { coordH: 7, coordV: 7 },
                    word: '',
                    orientation: Orientation.Horizontal,
                    linkedWords: [],
                },
            ];
        },
    };

    before(() => {
        const tile: Tile[][] = [];
        for (let coordH = 0; coordH <= MAX_BOARD_WIDTH; coordH++) {
            tile[coordH] = [];
            for (let coordV = 0; coordV <= MAX_BOARD_WIDTH; coordV++) {
                tile[coordH][coordV] = { bonus: Bonus.Base, tile: { letter: '', value: 0 }, placedThisTurn: false };
            }
        }
        TEST_BOARD = { content: tile, dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false };
    });

    beforeEach(() => {
        adminVirtualPlayerStub = sinon.createStubInstance(AdminVirtualPlayerService);
        const gameManagerMock = gameManagerServiceMock as unknown as GameManagerService;
        const commandHandlerMock = commandHandlerServiceMock as unknown as CommandHandlerService;
        const rackMock = rackServiceMock as unknown as RackService;
        const stringManipulationMock = stringManipulationServiceMock as unknown as StringManipulationService;
        const boardWordsMock = boardWordsServiceMock as unknown as BoardWordsService;
        virtualPlayer = new VirtualPlayerService(
            commandHandlerMock,
            gameManagerMock,
            rackMock,
            stringManipulationMock,
            boardWordsMock,
            adminVirtualPlayerStub as unknown as AdminVirtualPlayerService,
        );
    });

    afterEach(async () => {
        sinon.restore();
    });

    it('getVirtualPlayerName() returns a name', async () => {
        adminVirtualPlayerStub.getVirtualPlayers.resolves(DEFAULT_VIRTUAL_PLAYERS);
        sinon.stub(Tools, 'generateRandom').returns(1);
        expect(await virtualPlayer.getVirtualPlayerName('not in array', AiDifficulty.BEGINNER)).equal('Mikasa');
    });

    it('getVirtualPlayerName() returns a name', async () => {
        adminVirtualPlayerStub.getVirtualPlayers.resolves(DEFAULT_VIRTUAL_PLAYERS);
        const callBack = sinon.stub(Tools, 'generateRandom');
        callBack.onCall(0).returns(1);
        callBack.onCall(1).returns(2);
        expect(await virtualPlayer.getVirtualPlayerName('Mikasa', AiDifficulty.BEGINNER)).not.equal('Mikasa');
    });

    it('getVirtualPlayerName() returns a name', async () => {
        adminVirtualPlayerStub.getVirtualPlayers.rejects();

        expect(await virtualPlayer.getVirtualPlayerName('not in array', AiDifficulty.BEGINNER)).equal('Quandale Dingles');
    });

    it("getVirtualPlayerName() returns a name that is different from the host's name", () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.returns(1);
        stub.onFirstCall().returns(0);
        expect(virtualPlayer.getVirtualPlayerName('Mikasa', AiDifficulty.BEGINNER)).to.be.not.equal('Mikasa');
    });

    it('generateHints() returns a hint when there is a valid command', () => {
        const stub = sinon.stub(virtualPlayer as any, 'generateWordCombinations');
        stub.returns(['a']);
        const stubGenerate = sinon.stub(commandHandlerServiceMock, 'generatePlaceCommand');
        stubGenerate.returns({
            senderName: '',
            commandType: CommandType.Place,
            lettersToPlace: 's',

            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Horizontal,
        });
        const messageStub = sinon.stub(virtualPlayer as any, 'hintMessage');
        messageStub.returns('hint is found');
        expect(
            virtualPlayer.generateHints({ content: [], dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false }, { content: [] }),
        ).to.be.eql(['indices disponibles : 1', 'hint is found']);
    });

    it('generateHints() returns a hint when there is a valid command', () => {
        const stub = sinon.stub(virtualPlayer as any, 'generateWordCombinations');
        stub.returns(['a']);
        const stubGenerate = sinon.stub(commandHandlerServiceMock, 'generatePlaceCommand');
        stubGenerate.returns({
            senderName: '',
            commandType: CommandType.Place,
            lettersToPlace: '',
            placement: { coordV: 7, coordH: 7 },

            orientation: Orientation.Horizontal,
        });
        expect(
            virtualPlayer.generateHints({ content: [], dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false }, { content: [] }),
        ).to.be.eql([" Aucun indice n'a été trouvé"]);
    });

    it('generateValidCommands() returns  valid commands ', () => {
        const validCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },
                orientation: Orientation.Horizontal,
            },
            points: 1,
        };
        const stub = sinon.stub(virtualPlayer as any, 'generateWordCombinations');
        stub.returns(['a']);
        expect(virtualPlayer['generateValidCommands']({ content: [], dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false }, '')).to.be.eql([
            validCommand,
        ]);
    });

    it('generateValidCommands() does not return invalid command', () => {
        const stub = sinon.stub(virtualPlayer as any, 'generateWordCombinations');
        stub.returns(['a']);
        const stubGenerate = sinon.stub(commandHandlerServiceMock, 'generatePlaceCommand');
        stubGenerate.returns({
            senderName: '',
            commandType: CommandType.Place,

            lettersToPlace: '',
            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Horizontal,
        });
        expect(virtualPlayer['generateValidCommands']({ content: [], dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false }, '')).to.be.eql(
            [],
        );
    });

    it('generateValidCommands() returns  valid commands ', () => {
        const validCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },
                orientation: Orientation.Horizontal,
            },
            points: 1,
        };
        const stub = sinon.stub(virtualPlayer as any, 'generateWordCombinations');
        stub.returns(['a']);
        expect(virtualPlayer['generateValidCommands']({ content: [], dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false }, '')).to.be.eql([
            validCommand,
        ]);
    });

    it('getEasyVirtualPlayerCommand() returns a exchange command when no placement command is availale ', () => {
        const stub = sinon.stub(Tools, 'generateRandom');

        stub.returns(3);
        const getVirtualPlayerPlacementStub = sinon.stub(virtualPlayer as any, 'getVirtualPlayerPlacement');
        getVirtualPlayerPlacementStub.returns({
            senderName: '',
            commandType: CommandType.Place,
            lettersToPlace: '',
            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Horizontal,
        });
        expect(virtualPlayer.getEasyVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }).commandType).to.be.eql(
            CommandType.Exchange,
        );
    });

    it('getEasyVirtualPlayerCommand() returns a place command when a command is available ', () => {
        const command: PlaceCommand = {
            senderName: '',
            commandType: CommandType.Place,
            lettersToPlace: 's',
            placement: { coordV: 7, coordH: 7 },

            orientation: Orientation.Horizontal,
        };
        const stubGenerateRandom = sinon.stub(Tools, 'generateRandom');

        stubGenerateRandom.returns(3);
        const placeStub = sinon.stub(virtualPlayer as any, 'getVirtualPlayerPlacement');
        placeStub.returns(command);
        expect(virtualPlayer.getEasyVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }).commandType).to.be.eql(
            CommandType.Place,
        );
    });

    it('getEasyVirtualPlayerCommand() returns a skip command ', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.returns(0);
        expect(virtualPlayer.getEasyVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }).commandType).to.be.eql(
            CommandType.Pass,
        );
    });

    it('getExpertVirtualPlayerCommand() returns a exchange command when no placement command is available', async () => {
        const getValidCommandStub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        getValidCommandStub.returns([]);
        const result = await virtualPlayer.getExpertVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }, RESERVE_CAPACITY);
        expect(result.commandType).to.be.eql(CommandType.Exchange);
    });

    it('getExpertVirtualPlayerCommand() returns a pass command when no placement command is available and \
there is no more letters in the reserve', async () => {
        const getValidCommandStub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        getValidCommandStub.returns([]);
        const result = await virtualPlayer.getExpertVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }, 0);
        expect(result.commandType).to.be.eql(CommandType.Pass);
    });

    it('getExpertVirtualPlayerCommand() returns a pass command when the commands take more than the timeout time to generate', async () => {
        const getValidCommandStub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        getValidCommandStub.returns([]);
        Object.defineProperty(virtualPlayer, 'maxVirtualPlayerTurnDuration', { value: 0, writable: true });
        sinon.stub(global, 'clearTimeout');
        const result = await virtualPlayer.getExpertVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }, 0);
        expect(result.commandType).to.be.eql(CommandType.Pass);
    });

    it('getExpertVirtualPlayerCommand() returns a place command when a command is available ', async () => {
        const command: PlaceCommand = {
            senderName: '',
            commandType: CommandType.Place,
            lettersToPlace: 's',
            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Horizontal,
        };
        const placeStub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        placeStub.returns([{ command, points: 1 }]);
        const result = await virtualPlayer.getExpertVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }, RESERVE_CAPACITY);
        expect(result.commandType).to.be.eql(CommandType.Place);
    });

    it('getVirtualPlayerCommand() call the easyPlayer method ', () => {
        const stub = sinon.stub(virtualPlayer as any, 'getEasyVirtualPlayerCommand');
        virtualPlayer.getVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }, AiDifficulty.BEGINNER, RESERVE_CAPACITY);
        expect(stub.called).to.be.true;
    });

    it('getVirtualPlayerCommand() returns a expertPlayer Placement ', () => {
        const stub = sinon.stub(virtualPlayer as any, 'getExpertVirtualPlayerCommand');
        virtualPlayer.getVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }, AiDifficulty.EXPERT, RESERVE_CAPACITY);
        expect(stub.called).to.be.true;
    });

    it('getEasyVirtualPlayerCommand() returns a skip command ', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.returns(0);
        expect(virtualPlayer.getEasyVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }).commandType).to.be.eql(
            CommandType.Pass,
        );
    });

    it('getEasyVirtualPlayerCommand() returns an exchange when the probability is less than 1', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.returns(1);
        expect(virtualPlayer.getEasyVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] }).commandType).to.be.eql(
            CommandType.Exchange,
        );
    });

    it('getEasyVirtualPlayerCommand() calls the right generateRandom) ', () => {
        const generateSpy = sinon.stub(Tools, 'generateRandom');
        virtualPlayer.getEasyVirtualPlayerCommand(TEST_BOARD, { content: [{ letter: 'a', value: 2 }] });
        expect(generateSpy.called).to.be.true;
    });

    it('getEasyVirtualPlayerPlacement() calls getCommandByPoints() when EASY_POINTS_PROBABILITY', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.returns(EASY_POINTS_PROBABILITY - 1);
        const spy = sinon.stub(virtualPlayer as any, 'getCommandByPoints');
        virtualPlayer['getVirtualPlayerPlacement'](TEST_BOARD, 'abc');
        expect(spy.called).to.be.true;
    });

    it('getEasyVirtualPlayerPlacement() calls getCommandByPoints() when MEDIUM_POINTS_PROBABILITY', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.returns(MEDIUM_POINTS_PROBABILITY - 1);
        const spy = sinon.stub(virtualPlayer as any, 'getCommandByPoints');
        virtualPlayer['getVirtualPlayerPlacement'](TEST_BOARD, 'abc');
        expect(spy.called).to.be.true;
    });

    it('getEasyVirtualPlayerPlacement() calls getCommandByPoints() when max limit', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.returns(16);
        const spy = sinon.stub(virtualPlayer as any, 'getCommandByPoints');
        virtualPlayer['getVirtualPlayerPlacement'](TEST_BOARD, 'abc');
        expect(spy.called).to.be.true;
    });

    it('getCommandByPoints() calls generateValidCommands', () => {
        const stub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        stub.returns([]);
        virtualPlayer['getCommandByPoints'](EMPTY_BOARD, 'abc', 0);
        expect(stub.calledOnce).to.be.true;
    });

    it('getCommandByPoints() returns default place command when there is no valid commands', () => {
        const validCommands: ValidCommand[] = [];
        const stub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        stub.returns(validCommands);
        expect(virtualPlayer['getCommandByPoints'](EMPTY_BOARD, 'abc', 0)).eql(DEFAULT_PLACE_COMMAND);
    });

    it('getCommandByPoints() returns the last command when the threhhold is too high', () => {
        const firstValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },
                orientation: Orientation.Horizontal,
            },
            points: 6,
        };
        const secondValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',

                placement: { coordV: 7, coordH: 7 },
                orientation: Orientation.Horizontal,
            },
            points: 9,
        };
        const validCommands = [firstValidCommand, secondValidCommand];
        const stub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        stub.returns(validCommands);
        expect(virtualPlayer['getCommandByPoints'](EMPTY_BOARD, 'abc', 12)).eql(secondValidCommand.command);
    });

    it('getCommandByPoints() returns the right command', () => {
        const firstValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },

                orientation: Orientation.Horizontal,
            },
            points: 6,
        };
        const secondValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,

                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },
                orientation: Orientation.Horizontal,
            },
            points: 9,
        };
        const validCommands = [firstValidCommand, secondValidCommand];
        const stub = sinon.stub(virtualPlayer as any, 'generateValidCommands');
        stub.returns(validCommands);
        expect(virtualPlayer['getCommandByPoints'](EMPTY_BOARD, 'abc', 0)).eql(firstValidCommand.command);
    });

    it('generateValidCommands() return commands that generates points ', () => {
        const firstValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },
                orientation: Orientation.Horizontal,
            },
            points: 6,
        };
        const secondValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },

                orientation: Orientation.Horizontal,
            },
            points: 9,
        };
        const unorderedValidCommands: ValidCommand[] = [secondValidCommand, firstValidCommand];
        const expectedSortedCommands: ValidCommand[] = [firstValidCommand, secondValidCommand];

        expect(virtualPlayer['sortbyPoints'](unorderedValidCommands)).eql(expectedSortedCommands);
    });

    it('sortByPoints() return a sorted validCommands list', () => {
        const firstValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },

                orientation: Orientation.Horizontal,
            },
            points: 6,
        };
        const secondValidCommand: ValidCommand = {
            command: {
                senderName: '',
                commandType: CommandType.Place,
                lettersToPlace: 's',
                placement: { coordV: 7, coordH: 7 },

                orientation: Orientation.Horizontal,
            },
            points: 9,
        };
        const unorderedValidCommands: ValidCommand[] = [secondValidCommand, firstValidCommand];
        const expectedSortedCommands: ValidCommand[] = [firstValidCommand, secondValidCommand];

        expect(virtualPlayer['sortbyPoints'](unorderedValidCommands)).eql(expectedSortedCommands);
    });
    it('selectHints() returns 3 hints when there is more than 3 hints', () => {
        const hints = ['a', 'b', 'c', 'd', 'e'];
        expect(virtualPlayer['selectHints'](hints).length).eql(3);
    });

    it('selectHints() returns the right message when there is no hints ', () => {
        const hints = [" Aucun indice n'a été trouvé"];
        expect(virtualPlayer['selectHints']([])).eql(hints);
    });

    it('selectHints() returns two hints when theres two hints', () => {
        expect(virtualPlayer['selectHints'](['a', 'b']).length).eql(3);
    });

    it('hintMessage() returns the right hint message corresponding to the command', () => {
        const command: PlaceCommand = {
            senderName: '',
            commandType: CommandType.Place,
            lettersToPlace: 's',

            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Horizontal,
        };
        const word = 'word';
        const points = 6;
        const expectedMessage: string = word + '\n' + 'Commande: ' + 'command' + '\n' + 'Points: ' + points;
        expect(virtualPlayer['hintMessage'](command, word, points)).eql(expectedMessage);
    });

    it('genertateWordCombinations() calls the right functions when there is a word on board', () => {
        const generateCombinationsSpy = sinon.spy(stringManipulationServiceMock, 'generateCombinations');
        const splitStringSpy = sinon.spy(stringManipulationServiceMock, 'splitString');
        const permuteSpy = sinon.spy(stringManipulationServiceMock, 'permute');
        virtualPlayer['generateWordCombinations']('abc', ['b'], DEFAULT_DICTIONARY_ID);
        expect(generateCombinationsSpy.called).equal(true);
        expect(splitStringSpy.calledTwice).equal(true);
        expect(permuteSpy.calledTwice).equal(true);
    });

    it('genertateWordCombinations() calls the right functions when wordOnBoard is empty', () => {
        const generateCombinationsSpy = sinon.spy(stringManipulationServiceMock, 'generateCombinations');
        const splitStringSpy = sinon.spy(stringManipulationServiceMock, 'splitString');
        const permuteSpy = sinon.spy(stringManipulationServiceMock, 'permute');
        virtualPlayer['generateWordCombinations']('abc', [], DEFAULT_DICTIONARY_ID);
        expect(generateCombinationsSpy.called).equal(true);
        expect(splitStringSpy.calledTwice).equal(true);
        expect(permuteSpy.calledTwice).equal(true);
    });

    it('getRandomLettersFromRack() should return an empty list if generateMultipleRandom does so', () => {
        const stub = sinon.stub(Tools, 'generateMultipleRandom').returns([]);
        expect(virtualPlayer['getRandomLettersFromRack']([], 0)).eql('');
        expect(stub.calledWith(0, 0, true)).equal(true);
    });

    it('getRandomLettersFromRack() should return letters with index returned by generateMultipleRandom', () => {
        sinon.stub(Tools, 'generateMultipleRandom').returns([1]);
        expect(
            virtualPlayer['getRandomLettersFromRack'](
                [
                    { letter: 'A', value: 2 },
                    { letter: 'B', value: 1 },
                ],
                1,
            ),
        ).eql('b');
    });
});
