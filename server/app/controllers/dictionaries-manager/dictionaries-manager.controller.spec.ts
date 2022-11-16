import { Application } from '@app/app';
import { DICTIONARY_CONFLICT_ERROR_MESSAGE, DICTIONARY_FORMAT_ERROR_MESSAGE } from '@app/classes/constants/database-constant';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('DictionariesManagerController', () => {
    let dictionariesManagerService: SinonStubbedInstance<DictionariesManagerService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        dictionariesManagerService = createStubInstance(DictionariesManagerService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['dictionariesManagerController'], 'dictionariesManager', {
            value: dictionariesManagerService,
            writable: true,
        });
        expressApp = app.app;
    });

    it('should return a list of dictionaries header', async () => {
        const expectedMessage: DictionaryHeader[] = [
            { id: DEFAULT_DICTIONARY_ID, title: 'Dictionnaire-francais', description: 'Description de base' },
        ];
        dictionariesManagerService.getDictionariesHeaders.resolves(expectedMessage);
        return supertest(expressApp)
            .get('/api/dictionaries/dictionariesList')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(expectedMessage);
            });
    });
    it('should return an error as a message on service fail', async () => {
        dictionariesManagerService.getDictionariesHeaders.rejects(new Error('service error'));
        return supertest(expressApp)
            .get('/api/dictionaries/dictionariesList')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return te dictionary file to be downloaded', async () => {
        const dictionaryId = 'test';
        const validDictionary: JSON = JSON.parse(
            '{"id": "test","title": "TestDico","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }',
        );

        dictionariesManagerService.getDictionary.resolves(validDictionary);
        return supertest(expressApp)
            .get('/api/dictionaries/' + dictionaryId)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(validDictionary);
            });
    });
    it('should return an error as a message on service fail', async () => {
        const dictionaryId = 'test';

        dictionariesManagerService.getDictionary.rejects(new Error());
        return supertest(expressApp)
            .get('/api/dictionaries/' + dictionaryId)
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('delete should return no body', async () => {
        const dictionaryId = 'test';
        dictionariesManagerService.removeDictionary.resolves();

        return supertest(expressApp)
            .delete('/api/dictionaries/' + dictionaryId)
            .expect(StatusCodes.NO_CONTENT)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
                chai.expect(dictionariesManagerService.removeDictionary.calledWith(dictionaryId));
            });
    });

    it('delete should return no body', async () => {
        dictionariesManagerService.resetDictionaries.resolves();

        return supertest(expressApp)
            .delete('/api/dictionaries/')
            .expect(StatusCodes.NO_CONTENT)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
                chai.expect(dictionariesManagerService.resetDictionaries.called).equal(true);
            });
    });

    it('should return an error as a message on service fail', async () => {
        dictionariesManagerService.resetDictionaries.rejects(new Error('service error'));

        return supertest(expressApp)
            .delete('/api/dictionaries/')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail', async () => {
        const dictionaryId = 'test';
        dictionariesManagerService.removeDictionary.rejects(new Error('service error'));

        return supertest(expressApp)
            .delete('/api/dictionaries/' + dictionaryId)
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return no body', async () => {
        const dictionary: JSON = JSON.parse(
            '{"id": "test","title": "TestDico","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }',
        );
        dictionariesManagerService.addDictionary.resolves();

        return supertest(expressApp)
            .post('/api/dictionaries/addDictionary')
            .expect(StatusCodes.NO_CONTENT)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({});
                chai.expect(dictionariesManagerService.addDictionary.calledWith(dictionary));
            });
    });

    it('should return an error as a message on service fail', async () => {
        dictionariesManagerService.addDictionary.rejects(new Error('service error'));

        return supertest(expressApp)
            .post('/api/dictionaries/addDictionary')
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail', async () => {
        dictionariesManagerService.addDictionary.rejects(new Error(DICTIONARY_CONFLICT_ERROR_MESSAGE));

        return supertest(expressApp)
            .post('/api/dictionaries/addDictionary')
            .expect(StatusCodes.CONFLICT)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail', async () => {
        dictionariesManagerService.addDictionary.rejects(new Error(DICTIONARY_FORMAT_ERROR_MESSAGE));

        return supertest(expressApp)
            .post('/api/dictionaries/addDictionary')
            .expect(StatusCodes.UNSUPPORTED_MEDIA_TYPE)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return true if the modification is a success, and false otherwise', async () => {
        dictionariesManagerService.modifyDictionary.resolves(true);
        return supertest(expressApp)
            .patch('/api/dictionaries/modifyDictionary/' + DEFAULT_DICTIONARY_ID)
            .expect(StatusCodes.NO_CONTENT);
    });

    it('should return an error as a message on service fail', async () => {
        dictionariesManagerService.modifyDictionary.rejects(new Error('service error'));
        return supertest(expressApp)
            .patch('/api/dictionaries/modifyDictionary/' + DEFAULT_DICTIONARY_ID)
            .expect(StatusCodes.BAD_GATEWAY)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });

    it('should return an error as a message on service fail', async () => {
        dictionariesManagerService.modifyDictionary.rejects(new Error(DICTIONARY_CONFLICT_ERROR_MESSAGE));
        return supertest(expressApp)
            .patch('/api/dictionaries/modifyDictionary/' + DEFAULT_DICTIONARY_ID)
            .expect(StatusCodes.CONFLICT)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Error');
            });
    });
});
