import { Application } from '@app/app';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { GameType } from '@common/enums/enums';
import { HighScore, HighScoreClient } from '@common/interfaces/high-score';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('HighScoresController', () => {
    let highScoresService: SinonStubbedInstance<HighScoresService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        highScoresService = createStubInstance(HighScoresService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['highScoresController'], 'highScoresService', { value: highScoresService, writable: true });
        expressApp = app.app;
    });

    it('should return a list of highScoreClient', async () => {
        const expectedMessage: HighScoreClient[] = [{ names: ['Bob'], score: 2 }];
        highScoresService.getHighestHighScores.resolves(expectedMessage);

        return supertest(expressApp)
            .get('/api/highScores/CLASSIC')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(expectedMessage);
            });
    });

    it('should return an error as a message on service fail', async () => {
        highScoresService.getHighestHighScores.rejects(new Error('service error'));

        return supertest(expressApp)
            .get('/api/highScores/CLASSIC')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail', async () => {
        const newHighScore: HighScore = { name: 'Bob', score: 4, gameMode: GameType.CLASSIC };
        highScoresService.modifyHighScore.resolves();

        return supertest(expressApp)
            .put('/api/highScores/CLASSIC/Bob/4')
            .expect(StatusCodes.NO_CONTENT)
            .then((response) => {
                chai.expect(response.body).eql({});
                chai.expect(highScoresService.modifyHighScore.calledWith(newHighScore));
            });
    });

    it('should return an error as a message on service fail', async () => {
        highScoresService.modifyHighScore.rejects(new Error('service error'));

        return supertest(expressApp)
            .put('/api/highScores/CLASSIC/Bob/4')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return no body', async () => {
        highScoresService.deleteAllHighScores.resolves();

        return supertest(expressApp)
            .delete('/api/highScores')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
            });
    });

    it('should return an error as a message on service fail upon delete', async () => {
        highScoresService.deleteAllHighScores.rejects(new Error('service error'));

        return supertest(expressApp)
            .delete('/api/highScores')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });
});
