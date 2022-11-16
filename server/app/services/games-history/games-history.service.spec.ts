/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */

import { DATABASE_COLLECTION_GAME_HISTORY } from '@app/classes/constants/database-constant';
import { Room } from '@app/classes/interfaces/room';
import { DatabaseService } from '@app/services/database/database.service';
import { DatabaseServiceMock } from '@app/services/database/database.service.mock';
import { TEST_PLAYER, TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameType } from '@common/enums/enums';
import { GameHistory, PlayerHistory } from '@common/interfaces/game-history';
import { Player } from '@common/interfaces/player';
import { fail } from 'assert';
import { expect } from 'chai';
import { Collection } from 'mongodb';
import * as sinon from 'sinon';
import { GamesHistoryService } from './games-history.service';

describe('Service: GameHistory', () => {
    let databaseService: DatabaseServiceMock;
    let gamesHistoryService: GamesHistoryService;

    const gameDuration = 120; // in seconds

    const dateBegin: Date = new Date();
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const dateEnd: Date = new Date();
    dateEnd.setSeconds(dateEnd.getSeconds() + gameDuration);

    const firstPlayer: PlayerHistory = { name: 'John Scrabble', score: 69 };
    const secondPlayer: PlayerHistory = { name: 'Candice Scrabble', score: 420 };

    const testGameHistoryClassic: GameHistory = {
        dateBegin,
        dateEnd,
        gameDuration,
        firstPlayer,
        secondPlayer,
        gameMode: GameType.CLASSIC,
        wasAbandoned: false,
    };
    const testGameHistoryLog2990: GameHistory = {
        dateBegin,
        dateEnd,
        gameDuration,
        firstPlayer,
        secondPlayer,
        gameMode: GameType.LOG2990,
        wasAbandoned: false,
    };

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        await databaseService.closeConnection();
        await databaseService.start();
        gamesHistoryService = new GamesHistoryService(databaseService as unknown as DatabaseService);
        await gamesHistoryService.collection.insertOne(testGameHistoryClassic);
        await gamesHistoryService.collection.insertOne(testGameHistoryLog2990);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('collection getter should return the collection of the database', () => {
        const collection = gamesHistoryService.collection;
        expect(collection).eql(gamesHistoryService['databaseService'].database.collection(DATABASE_COLLECTION_GAME_HISTORY));
    });

    it('getGamesHistory should get all games history of the database', async () => {
        const gamesHistory = await gamesHistoryService.getGamesHistory();
        expect(gamesHistory.length).equal(2);
    });

    it('addGameHistory should add a gameHistory to the database', async () => {
        const newGameHistory: GameHistory = JSON.parse(JSON.stringify(testGameHistoryClassic));
        await gamesHistoryService.addGameHistory(newGameHistory);
        expect(await gamesHistoryService.collection.countDocuments()).equal(3);
    });

    it('addGameHistory should throw an error if there is a problem while adding gameHistory', async () => {
        sinon.stub(Collection.prototype, 'insertOne').rejects();
        const newGameHistory: GameHistory = JSON.parse(JSON.stringify(testGameHistoryClassic));
        try {
            await gamesHistoryService.addGameHistory(newGameHistory);
            fail('No problem here');
        } catch (error) {
            expect((error as Error).message).equal('Failed to create document');
        }
    });

    it('deleteGamesHistory should delete all gameHistory from the database', async () => {
        await gamesHistoryService.deleteGamesHistory();
        expect(await gamesHistoryService.collection.countDocuments()).equal(0);
    });

    it('deleteGamesHistory should throw an error if there is a problem while deleting gameHistory', async () => {
        sinon.stub(Collection.prototype, 'deleteMany').rejects();
        try {
            await gamesHistoryService.deleteGamesHistory();
            fail('No problem here');
        } catch (error) {
            expect((error as Error).message).equal('Failed to delete documents of collection');
        }
    });

    it('extractGameHistory should return call addGameHistory with correct values', () => {
        const room: Room = JSON.parse(JSON.stringify(TEST_ROOM_CLIENT)) as Room;
        room.dateBegin = dateBegin;
        const expected: GameHistory = {
            dateBegin,
            dateEnd,
            gameDuration,
            firstPlayer,
            secondPlayer,
            gameMode: GameType.CLASSIC,
            wasAbandoned: false,
        };

        const stub = sinon.stub(gamesHistoryService as any, 'extractPlayerHistory');
        stub.onFirstCall().returns(firstPlayer);
        stub.onSecondCall().returns(secondPlayer);

        const spy = sinon.spy(gamesHistoryService, 'addGameHistory');

        sinon.useFakeTimers(dateEnd.getTime());

        gamesHistoryService.extractGameHistory(room);

        expect(spy.calledWithMatch(expected)).equal(true);
    });

    it('extractPlayerHistory should return PlayerHistory with correct values', () => {
        const player: Player = JSON.parse(JSON.stringify(TEST_PLAYER));
        const expected: PlayerHistory = { name: player.name, score: player.points };

        const returnValue = gamesHistoryService['extractPlayerHistory'](player);

        expect(returnValue).eql(expected);
    });
});
