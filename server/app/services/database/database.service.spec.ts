/* eslint-disable dot-notation */
import { DATABASE_COLLECTION_HIGH_SCORES, DATABASE_COLLECTION_VIRTUAL_PLAYER } from '@app/classes/constants/database-constant';
import { fail } from 'assert';
import { expect } from 'chai';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import * as sinon from 'sinon';
import { DatabaseService, DATABASE_NAME, DATABASE_URL } from './database.service';

/* Tests inspired by the database.service.spec.ts of mongodb-example by Nikolay Radoev
 * Gitlab repository : https://gitlab.com/nikolayradoev/mongodb-example/-/blob/master/src/services/database.service.spec.ts */

const DELAY_SERVER_CREATION = 600000;

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(() => {
        databaseService = new DatabaseService();
    });

    beforeEach(async function () {
        // eslint-disable-next-line no-invalid-this
        this.timeout(DELAY_SERVER_CREATION);
        mongoServer = await MongoMemoryServer.create();
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close(true);
        }
        sinon.restore();
    });

    it('should connect to the database when start is called', async () => {
        const spy = sinon.spy(MongoClient, 'connect');
        const mongoUri = mongoServer.getUri();

        await databaseService.start(mongoUri);
        expect(databaseService['db'].databaseName).to.equal(DATABASE_NAME);
        expect(databaseService['client']).not.equal(undefined);
        expect(spy.calledWith(mongoUri)).equal(true);
    });

    it('should try to connect with DATABASE_URL by default', async () => {
        const spy = sinon.stub(MongoClient, 'connect');
        databaseService.start();
        expect(spy.calledWith(DATABASE_URL)).equal(true);
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        const spy = sinon.spy(MongoClient, 'connect');
        try {
            databaseService.start('WRONG URL');
            fail();
        } catch {
            expect(databaseService['client']).equal(undefined);
            expect(spy.calledWith('WRONG URL')).equal(true);
        }
    });

    it('should populate the database with a helper function', async () => {
        const databaseStartingSize = 10;
        const mongoUri = mongoServer.getUri();
        const client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(DATABASE_NAME);
        await databaseService.populateHighScores();
        const highScores = await databaseService.database.collection(DATABASE_COLLECTION_HIGH_SCORES).find({}).toArray();
        expect(highScores.length).equal(databaseStartingSize);
    });

    it('should populate the virtual Player database with a helper function', async () => {
        const databaseStartingSize = 6;
        const mongoUri = mongoServer.getUri();
        const client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db(DATABASE_NAME);
        await databaseService.populateVirtualPlayers();
        const virtualPlayers = await databaseService.database.collection(DATABASE_COLLECTION_VIRTUAL_PLAYER).find({}).toArray();
        expect(virtualPlayers.length).equal(databaseStartingSize);
    });

    it('should not populate the database with start function if it is already populated', async () => {
        const databaseStartingSize = 10;
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        let highScores = await databaseService.database.collection(DATABASE_COLLECTION_HIGH_SCORES).find({}).toArray();
        expect(highScores.length).equal(databaseStartingSize);

        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        highScores = await databaseService.database.collection(DATABASE_COLLECTION_HIGH_SCORES).find({}).toArray();
        expect(highScores.length).equal(databaseStartingSize);
    });

    it('should not populate the virtual player database with start function if it is already populated', async () => {
        const databaseStartingSize = 6;
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        let virtualPlayers = await databaseService.database.collection(DATABASE_COLLECTION_VIRTUAL_PLAYER).find({}).toArray();
        expect(virtualPlayers.length).equal(databaseStartingSize);

        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        virtualPlayers = await databaseService.database.collection(DATABASE_COLLECTION_VIRTUAL_PLAYER).find({}).toArray();
        expect(virtualPlayers.length).equal(databaseStartingSize);
    });
});
