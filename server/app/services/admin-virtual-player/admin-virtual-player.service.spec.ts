/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */

import { DATABASE_COLLECTION_VIRTUAL_PLAYER } from '@app/classes/constants/database-constant';
import { DatabaseService } from '@app/services/database/database.service';
import { DatabaseServiceMock } from '@app/services/database/database.service.mock';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { fail } from 'assert';
import { expect } from 'chai';
import { Collection } from 'mongodb';
import * as sinon from 'sinon';
import { AdminVirtualPlayerService } from './admin-virtual-player.service';

describe('Service: AdminVirtualPlayer', () => {
    let databaseService: DatabaseServiceMock;
    let service: AdminVirtualPlayerService;

    const testBeginnerVirtualPlayer: VirtualPlayer = { name: 'Napoleon', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
    const testExpertVirtualPlayer: VirtualPlayer = { name: 'George', virtualPlayerDifficulty: AiDifficulty.EXPERT };

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        await databaseService.closeConnection();
        await databaseService.start();
        service = new AdminVirtualPlayerService(databaseService as unknown as DatabaseService);
        await service.collection.insertOne(testBeginnerVirtualPlayer);
        await service.collection.insertOne(testExpertVirtualPlayer);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('collection getter should return the DATABASE_COLLECTION_VIRTUAL_PLAYER collection', () => {
        const collection = service.collection;
        expect(collection).eql(service['databaseService'].database.collection(DATABASE_COLLECTION_VIRTUAL_PLAYER));
    });

    it('getVirtualPlayers should get all beginner virtual Players of the database', async () => {
        const aiDifficulty: AiDifficulty = AiDifficulty.BEGINNER;
        const gamesHistory = await service.getVirtualPlayers(aiDifficulty);
        expect(gamesHistory.length).equal(1);
    });

    it('getVirtualPlayers should get all Expert virtual Players of the database', async () => {
        const aiDifficulty: AiDifficulty = AiDifficulty.EXPERT;
        const gamesHistory = await service.getVirtualPlayers(aiDifficulty);
        expect(gamesHistory.length).equal(1);
    });

    it('addVirtualPlayer should add a VirtualPlayer to the database', async () => {
        const newVirtualPlayer: VirtualPlayer = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        await service.addVirtualPlayer(newVirtualPlayer);
        expect(await service.collection.countDocuments()).equal(3);
    });

    it('addVirtualPlayer should throw an error if there is a problem while adding a virtualPlayer', async () => {
        sinon.stub(Collection.prototype, 'insertOne').rejects();
        sinon.stub(Collection.prototype, 'countDocuments').resolves(0);
        const virtualPlayers: VirtualPlayer = JSON.parse(JSON.stringify(testBeginnerVirtualPlayer));
        try {
            await service.addVirtualPlayer(virtualPlayers);
            fail('No problem here');
        } catch (error) {
            expect((error as Error).message).equal('Failed to create document');
        }
    });

    it('addVirtualPlayer should return a void promise if the name already exists in the data base', async () => {
        sinon.stub(Collection.prototype, 'countDocuments').resolves(1);
        const virtualPlayers: VirtualPlayer = JSON.parse(JSON.stringify(testBeginnerVirtualPlayer));
        service.addVirtualPlayer(virtualPlayers).then(Promise.resolve);
        expect(await service.collection.countDocuments()).equal(1);
    });

    it('modifyVirtualPlayer should return a void promise if the name already exists in the data base', async () => {
        sinon.stub(Collection.prototype, 'countDocuments').resolves(1);
        const virtualPlayers: VirtualPlayer = { name: 'Napoleon', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        service.modifyVirtualPlayer(virtualPlayers, testBeginnerVirtualPlayer).then(Promise.resolve);
        expect(await service.collection.countDocuments()).equal(1);
    });

    it('testBeginnerVirtualPlayer should delete the player passed as argument from the database', async () => {
        await service.deleteVirtualPlayer(testBeginnerVirtualPlayer);
        expect((await service.getVirtualPlayers(AiDifficulty.BEGINNER)).length).equal(0);
    });

    it('deleteAllVirtualPlayer should delete all the virtual players from the database', async () => {
        await service.deleteAllVirtualPlayer();
        expect(await service.collection.countDocuments()).equal(0);
    });

    it('deleteAllVirtualPlayer should throw an error if there is a problem while deleting gameHistory', async () => {
        sinon.stub(Collection.prototype, 'deleteMany').rejects();
        try {
            await service.deleteAllVirtualPlayer();
            fail('No problem here');
        } catch (error) {
            expect((error as Error).message).equal('Failed to delete documents of collection');
        }
    });

    it('deleteGamesHistory should throw an error if there is a problem while deleting gameHistory', async () => {
        sinon.stub(Collection.prototype, 'deleteOne').rejects();
        try {
            await service.deleteVirtualPlayer(testBeginnerVirtualPlayer);
            fail('No problem here');
        } catch (error) {
            expect((error as Error).message).equal('Failed to delete documents of collection');
        }
    });

    it('modifyVirtualPlayer should modify the player passed as argument from the database', async () => {
        const newVirtualName = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        await service.modifyVirtualPlayer(newVirtualName, testBeginnerVirtualPlayer);
        const playerFound = await service.collection.findOne({ name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER });
        expect(playerFound?.name).equal(newVirtualName.name);
    });

    it('populateVirtualPlayers should call populate from the db service', async () => {
        const spy = sinon.spy(databaseService, 'populateVirtualPlayers');
        await service.populateVirtualPlayers();
        expect(spy.called).equal(true);
    });

    it('modifyVirtualPlayer should throw an error if there is a problem while modifying a player', async () => {
        const newVirtualName = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };

        sinon.stub(Collection.prototype, 'updateOne').rejects();
        try {
            await service.modifyVirtualPlayer(newVirtualName, testBeginnerVirtualPlayer);
            fail('No problem here');
        } catch (error) {
            expect((error as Error).message).equal('Failed to update document');
        }
    });
});
