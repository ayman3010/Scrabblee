/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */

import { DATABASE_COLLECTION_HIGH_SCORES, NUMBER_OF_HIGHEST_SCORES, STARTING_DATABASE } from '@app/classes/constants/database-constant';
import { Room } from '@app/classes/interfaces/room';
import { DatabaseService } from '@app/services/database/database.service';
import { DatabaseServiceMock } from '@app/services/database/database.service.mock';
import { DEFAULT_PLAYER, EMPTY_ROOM_CLIENT } from '@common/constants/room-constants';
import { GameType } from '@common/enums/enums';
import { HighScore } from '@common/interfaces/high-score';
import { Player } from '@common/interfaces/player';
import { fail } from 'assert';
import { expect } from 'chai';
import { Collection } from 'mongodb';
import * as sinon from 'sinon';
import { HighScoresService } from './high-scores.service';

/* Tests inspired by the courses.service.spec.ts of mongodb-example by Nikolay Radoev
 * Gitlab repository : https://gitlab.com/nikolayradoev/mongodb-example/-/blob/master/src/services/courses.service.spec.ts */

describe('HighScores Service', () => {
    let databaseService: DatabaseServiceMock;
    let highScoresService: HighScoresService;

    const testHighScoreClassic: HighScore = { name: 'Bob Gratton', score: 3, gameMode: GameType.CLASSIC };
    const testHighScoreLog2990: HighScore = { name: 'Bob Gratton', score: 3, gameMode: GameType.LOG2990 };

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        await databaseService.closeConnection();
        await databaseService.start();
        highScoresService = new HighScoresService(databaseService as unknown as DatabaseService);
        await highScoresService.collection.insertOne(testHighScoreClassic);
        await highScoresService.collection.insertOne(testHighScoreLog2990);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('collection getter should return the collection of the database', () => {
        const collection = highScoresService.collection;
        expect(collection).eql(highScoresService['databaseService'].database.collection(DATABASE_COLLECTION_HIGH_SCORES));
    });

    it('getHighestHighScores should get the highest high scores of a specified gameMode from database', async () => {
        await highScoresService.collection.insertMany(STARTING_DATABASE);
        const highScores = await highScoresService.getHighestHighScores(GameType.CLASSIC);
        expect(highScores.length).equal(NUMBER_OF_HIGHEST_SCORES);
    });

    it('getHighestHighScores should put together names with same score', async () => {
        const newHighScore = { name: 'Bob', score: 3, gameMode: GameType.CLASSIC };
        await highScoresService.collection.insertOne(newHighScore);
        const highScores = await highScoresService.getHighestHighScores(GameType.CLASSIC);
        expect(highScores.length).equal(1);
        expect(highScores[0].names.length).equal(2);
    });

    it('modifyHighScore should add a highScore to the database if there is no highScore in the gameMode with same name', async () => {
        sinon.stub(highScoresService as any, 'validateName').returns(true);

        const newHighScore = { name: 'Bob', score: 4, gameMode: GameType.CLASSIC };
        await highScoresService.modifyHighScore(newHighScore);
        expect(await highScoresService.collection.countDocuments()).equal(3);
    });

    it('modifyHighScore should update a highScore in the database if there is a highScore with lower score in the gameMode \
        with same name', async () => {
        sinon.stub(highScoresService as any, 'validateName').returns(true);

        const newHighScore = { name: 'Bob Gratton', score: 4, gameMode: GameType.CLASSIC };
        await highScoresService.modifyHighScore(newHighScore);
        const updatedHighScore = await highScoresService.collection.findOne({ name: 'Bob Gratton', gameMode: GameType.CLASSIC });
        expect(await highScoresService.collection.countDocuments()).equal(2);
        expect(updatedHighScore?.score).equal(newHighScore.score);
    });

    it('modifyHighScore should not update a highScore in the database if there is a highScore with higher score in the gameMode \
        with same name', async () => {
        sinon.stub(highScoresService as any, 'validateName').returns(true);

        const newHighScore = { name: 'Bob Gratton', score: 2, gameMode: GameType.CLASSIC };
        await highScoresService.modifyHighScore(newHighScore);
        const updatedHighScore = await highScoresService.collection.findOne({ name: 'Bob Gratton', gameMode: GameType.CLASSIC });
        expect(await highScoresService.collection.countDocuments()).equal(2);
        expect(updatedHighScore?.score).equal(testHighScoreClassic.score);
    });

    it('modifyHighScore should not do anything if name is invalid', async () => {
        sinon.stub(highScoresService as any, 'validateName').returns(false);

        const newHighScore = { name: 'Invalid Name', score: 2, gameMode: GameType.CLASSIC };
        await highScoresService.modifyHighScore(newHighScore);
        const updatedHighScore = await highScoresService.collection.findOne({ name: 'Invalid Name', gameMode: GameType.CLASSIC });
        expect(await highScoresService.collection.countDocuments()).equal(2);
        expect(updatedHighScore).equal(null);
    });

    it('validateName should return false if name is too short', () => {
        expect(highScoresService['validateName']('')).equal(false);
    });

    it('validateName should return false if name is too long', () => {
        expect(highScoresService['validateName']('Name that is too long whenever I see it I am scared')).equal(false);
    });

    it('validateName should return true if name has correct length', () => {
        expect(highScoresService['validateName']('Perfect')).equal(true);
    });

    it('extractHighScoreFromRoom should call extractHighScoreFromPlayer twice', () => {
        const room: Room = JSON.parse(JSON.stringify(EMPTY_ROOM_CLIENT)) as Room;
        room.gameOptions.singlePlayer = false;
        const spy = sinon.stub(highScoresService as any, 'extractHighScoreFromPlayer');
        highScoresService.extractHighScoreFromRoom(room);
        expect(spy.calledTwice).equal(true);
    });

    it('extractHighScoreFromRoom should call extractHighScoreFromPlayer once if game is singlePlayer', () => {
        const room: Room = JSON.parse(JSON.stringify(EMPTY_ROOM_CLIENT)) as Room;
        room.gameOptions.singlePlayer = true;
        const spy = sinon.stub(highScoresService as any, 'extractHighScoreFromPlayer');
        highScoresService.extractHighScoreFromRoom(room);
        expect(spy.calledOnce).equal(true);
    });

    it('extractHighScoreFromPlayer should call modifyHighScore if player did not abandon', () => {
        const player: Player = { ...DEFAULT_PLAYER, name: 'John Scrabble', points: 69, abandoned: false };
        const highScore: HighScore = { name: 'John Scrabble', score: 69, gameMode: GameType.CLASSIC };
        const spy = sinon.stub(highScoresService, 'modifyHighScore');
        highScoresService['extractHighScoreFromPlayer'](player, GameType.CLASSIC);
        expect(spy.calledWith(highScore)).equal(true);
    });

    it('extractHighScoreFromPlayer should not call modifyHighScore if player did abandon', () => {
        const player: Player = { ...DEFAULT_PLAYER, name: 'John Scrabble', points: 69, abandoned: true };
        const spy = sinon.stub(highScoresService, 'modifyHighScore');
        highScoresService['extractHighScoreFromPlayer'](player, GameType.CLASSIC);
        expect(spy.called).equal(false);
    });

    describe('Error handling', async () => {
        it('should throw an error if we try to get highScores on a closed connection', async () => {
            await databaseService.start();
            await databaseService.closeConnection();
            try {
                await highScoresService.getHighestHighScores(GameType.CLASSIC).catch(() => {
                    throw new Error('Database not connected');
                });
                fail('No problem here');
            } catch (error) {
                expect((error as Error).message).equal('Database not connected');
            }
        });

        it('should throw an error if we try to get highScores on a closed connection', async () => {
            await databaseService.start();
            await databaseService.closeConnection();
            const newHighScore = { name: 'Bob', score: 4, gameMode: GameType.CLASSIC };
            try {
                await highScoresService.modifyHighScore(newHighScore).catch(() => {
                    throw new Error('Database not connected');
                });
                fail('No problem here');
            } catch (error) {
                expect((error as Error).message).equal('Database not connected');
            }
        });

        it('should throw an error if there is a problem while adding highScore', async () => {
            sinon.stub(Collection.prototype, 'updateOne').rejects();
            const newHighScore = { name: 'Bob', score: 4, gameMode: GameType.CLASSIC };
            try {
                await highScoresService.modifyHighScore(newHighScore);
                fail('No problem here');
            } catch (error) {
                expect((error as Error).message).equal('Failed to update document');
            }
        });
        it('populateVirtualPlayers should call populate from the db service', async () => {
            const spy = sinon.spy(databaseService, 'populateHighScores');
            await highScoresService.populateDefaultHighScores();
            expect(spy.called).equal(true);
        });

        it('deleteAllVirtualPlayer should throw an error if there is a problem while deleting gameHistory', async () => {
            sinon.stub(Collection.prototype, 'deleteMany').rejects();
            try {
                await highScoresService.deleteAllHighScores();
                fail('No problem here');
            } catch (error) {
                expect((error as Error).message).equal('Failed to delete documents of collection');
            }
        });

        it('deleteAllVirtualPlayer should delete all the virtual players from the database', async () => {
            await highScoresService.deleteAllHighScores();
            expect(await highScoresService.collection.countDocuments()).equal(0);
        });
    });
});
