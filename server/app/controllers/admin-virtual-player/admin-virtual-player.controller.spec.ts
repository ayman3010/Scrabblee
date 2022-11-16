import { Application } from '@app/app';
import { NAME_CONFLICT_ERROR_MESSAGE } from '@app/classes/constants/database-constant';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-virtual-player.service';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('AdminVirtualPlayerController', () => {
    let adminVirtualPlayerService: SinonStubbedInstance<AdminVirtualPlayerService>;
    let expressApp: Express.Application;
    const app = Container.get(Application);

    beforeEach(async () => {
        adminVirtualPlayerService = createStubInstance(AdminVirtualPlayerService);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['adminVirtualPlayerController'], 'adminVirtualPlayerService', { value: adminVirtualPlayerService, writable: true });
        expressApp = app.app;
    });

    it('should return a list of virtualPlayers', async () => {
        const expectedMessage: VirtualPlayer[] = [{ name: 'louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER }];
        adminVirtualPlayerService.getVirtualPlayers.resolves(expectedMessage);

        return supertest(expressApp)
            .get('/api/virtualPlayers/Debutant')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(expectedMessage);
            });
    });

    it('should return an error as a message on service fail', async () => {
        adminVirtualPlayerService.getVirtualPlayers.rejects(new Error('service error'));

        return supertest(expressApp)
            .get('/api/virtualPlayers/Debutant')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail', async () => {
        adminVirtualPlayerService.getVirtualPlayers.rejects(new Error('service error'));

        return supertest(expressApp)
            .get('/api/virtualPlayers/Debutant')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return no body', async () => {
        adminVirtualPlayerService.deleteVirtualPlayer.resolves();

        return supertest(expressApp)
            .delete('/api/virtualPlayers/Debutant')
            .send({ name: 'john' })
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
            });
    });

    it('should return no body', async () => {
        adminVirtualPlayerService.deleteAllVirtualPlayer.resolves();

        return supertest(expressApp)
            .delete('/api/virtualPlayers')
            .send({ name: 'john' })
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
            });
    });

    it('should return ok after successful post', async () => {
        adminVirtualPlayerService.addVirtualPlayer.resolves();

        return supertest(expressApp)
            .post('/api/virtualPlayers/Debutant')
            .send({ name: 'john' })
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
            });
    });

    it('should return ok after successful put', async () => {
        adminVirtualPlayerService.modifyVirtualPlayer.resolves();
        const testBeginnerVirtualPlayer: VirtualPlayer = { name: 'Napoleon', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const newVirtualName = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const list = [newVirtualName, testBeginnerVirtualPlayer];
        return supertest(expressApp)
            .put('/api/virtualPlayers/Debutant')
            .send({ updateDataList: list })
            .expect(StatusCodes.NO_CONTENT)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
            });
    });

    it('should return CONFLICT message after unsuccessful put because of conflict', async () => {
        adminVirtualPlayerService.modifyVirtualPlayer.rejects(new Error(NAME_CONFLICT_ERROR_MESSAGE));
        const testBeginnerVirtualPlayer: VirtualPlayer = { name: 'Napoleon', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const newVirtualName = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const list = [newVirtualName, testBeginnerVirtualPlayer];
        return supertest(expressApp)
            .put('/api/virtualPlayers/Debutant')
            .send({ updateDataList: list })
            .expect(StatusCodes.CONFLICT)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return BAD_GATEWAY message after unsuccessful put', async () => {
        adminVirtualPlayerService.modifyVirtualPlayer.rejects(new Error('service error'));
        const testBeginnerVirtualPlayer: VirtualPlayer = { name: 'Napoleon', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const newVirtualName = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const list = [newVirtualName, testBeginnerVirtualPlayer];
        return supertest(expressApp)
            .put('/api/virtualPlayers/Debutant')
            .send({ updateDataList: list })
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail upon post', async () => {
        adminVirtualPlayerService.addVirtualPlayer.rejects(new Error('service error'));

        return supertest(expressApp)
            .post('/api/virtualPlayers/Debutant')
            .send({ name: 'john' })
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an conflict error as a message on service fail upon conflict', async () => {
        adminVirtualPlayerService.addVirtualPlayer.rejects(new Error(NAME_CONFLICT_ERROR_MESSAGE));

        return supertest(expressApp)
            .post('/api/virtualPlayers/Debutant')
            .send({ name: 'john' })
            .expect(StatusCodes.CONFLICT)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail upon delete', async () => {
        adminVirtualPlayerService.deleteVirtualPlayer.rejects(new Error('service error'));

        return supertest(expressApp)
            .delete('/api/virtualPlayers/Debutant')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail upon delete', async () => {
        adminVirtualPlayerService.deleteAllVirtualPlayer.rejects(new Error('service error'));

        return supertest(expressApp)
            .delete('/api/virtualPlayers/')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });
});
