import { Application } from '@app/app';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { GameType } from '@common/enums/enums';
import { GameHistoryClient, PlayerHistory } from '@common/interfaces/game-history';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GamesHistoryController', () => {
    let gamesHistoryService: SinonStubbedInstance<GamesHistoryService>;
    let expressApp: Express.Application;

    const gameDuration = 120; // in seconds

    const dateBegin: Date = new Date();
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const dateEnd: Date = new Date();
    dateEnd.setSeconds(dateEnd.getSeconds() + gameDuration);

    const firstPlayer: PlayerHistory = { name: 'John Scrabble', score: 69 };
    const secondPlayer: PlayerHistory = { name: 'Candice Scrabble', score: 420 };

    const testGameHistoryClassic: GameHistoryClient = {
        dateBegin,
        dateEnd,
        gameDuration,
        firstPlayer,
        secondPlayer,
        gameMode: GameType.CLASSIC,
        id: '1',
        wasAbandoned: false,
    };

    beforeEach(async () => {
        gamesHistoryService = createStubInstance(GamesHistoryService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['gamesHistoryController'], 'gamesHistoryService', { value: gamesHistoryService, writable: true });
        expressApp = app.app;
    });

    it('should return a list of gameHistoryClient', async () => {
        const expectedMessage: GameHistoryClient[] = [testGameHistoryClassic];
        gamesHistoryService.getGamesHistory.resolves(expectedMessage);

        return supertest(expressApp)
            .get('/api/gamesHistory')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(expectedMessage)));
            });
    });

    it('should return an error as a message on service fail', async () => {
        gamesHistoryService.getGamesHistory.rejects(new Error('service error'));

        return supertest(expressApp)
            .get('/api/gamesHistory')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return no body', async () => {
        gamesHistoryService.deleteGamesHistory.resolves();

        return supertest(expressApp)
            .delete('/api/gamesHistory')
            .expect(StatusCodes.NO_CONTENT)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
            });
    });

    it('should return an error as a message on service fail upon delete', async () => {
        gamesHistoryService.deleteGamesHistory.rejects(new Error('service error'));

        return supertest(expressApp)
            .delete('/api/gamesHistory')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });
});
