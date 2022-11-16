/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable dot-notation */
import { Trie } from '@app/classes/trie/trie';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import { fail } from 'assert';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { DictionariesManagerService, Dictionary } from './dictionaries-manager.service';

describe('DictionariesManagerService Tests', () => {
    const defaultDictionaryTitle = 'TestDico';
    const defaultDictionaryId = 'Dictionnaire-francais';
    let dictionariesManagerService: DictionariesManagerService;
    const validDictionaryString =
        '{"id": "Dictionnaire-francais","title": "TestDico","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }';
    const validDictionary: JSON = JSON.parse(validDictionaryString);
    const invalidDictionary: JSON = JSON.parse('{"title": "TestDico"}');
    const mockDictionary: Dictionary = {
        id: defaultDictionaryId,
        title: defaultDictionaryTitle,
        description: 'gottem',
        deleted: false,
        wordsTrie: new Trie(),
    };
    const mockRawDictionary = { id: defaultDictionaryId, title: defaultDictionaryTitle, description: 'gottem', words: ['gottem'] };
    const mockRawDictionaryString = JSON.stringify(mockRawDictionary);
    let writeFileSyncStub: sinon.SinonStub;
    let unlinkSyncStub: sinon.SinonStub;

    beforeEach(() => {
        const tempStub = sinon.stub(fs, 'readdirSync').returns([]);
        dictionariesManagerService = new DictionariesManagerService();
        Object.defineProperty(dictionariesManagerService, 'trieDictionaryPath', {
            get() {
                return './tests/assets/trie/';
            },
        });
        tempStub.restore();
        writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
        unlinkSyncStub = sinon.stub(fs, 'unlinkSync');
        const readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(validDictionaryString);
        dictionariesManagerService['createTrieFromDictionary'](defaultDictionaryId);
        readFileSyncStub.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('isValidDictionary return true, if JSON file is a valid dictionary', () => {
        expect(dictionariesManagerService['isValidDictionary'](validDictionary)).to.equal(true);
    });

    it('isValidDictionary return false, if tere is a space in te title', () => {
        const invalidTitle: JSON = JSON.parse(
            '{"title": "Test Dico","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }',
        );
        expect(dictionariesManagerService['isValidDictionary'](invalidTitle)).to.equal(false);
    });

    it('isValidDictionary return false if a section of the dictionary is missing', () => {
        const invalidTitleDictionary: JSON = JSON.parse('{ "description": "validDictionary", "words": ["couscous","tajine","pastilla"] }');
        const invalidDescriptionDictionary: JSON = JSON.parse('{  "title": "TestDico", "words": ["couscous","tajine","pastilla"] }');
        const invalidWordsDictionary: JSON = JSON.parse('{  "title": "TestDico","description": "A valid dictionary" }');
        expect(dictionariesManagerService['isValidDictionary'](invalidTitleDictionary)).to.equal(false);
        expect(dictionariesManagerService['isValidDictionary'](invalidDescriptionDictionary)).to.equal(false);
        expect(dictionariesManagerService['isValidDictionary'](invalidWordsDictionary)).to.equal(false);
    });

    it('isValidDictionary return false if the title is too long', () => {
        const invalidTitleDictionary: JSON = JSON.parse(
            '{ "title": "LoooooooooooooooooooooooooooooooooongName","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }',
        );
        expect(dictionariesManagerService['isValidDictionary'](invalidTitleDictionary)).to.equal(false);
    });

    it('isValidDictionary return false if there is two times the same word in the dictionary', () => {
        const invalidWordsDictionary: JSON = JSON.parse(
            '{ "title": "testdico","description": "A valid dictionary", "words": ["couscous","tajine","couscous"] }',
        );
        expect(dictionariesManagerService['isValidDictionary'](invalidWordsDictionary)).to.equal(false);
    });

    it('getDictionary should return the JSON file of the dictionary', async () => {
        sinon.stub(fs, 'readFileSync').returns(validDictionaryString);
        const expectedDictionaryFile = JSON.parse(validDictionaryString);
        const result = await dictionariesManagerService.getDictionary(DEFAULT_DICTIONARY_ID);

        expect(result).to.eql(expectedDictionaryFile);
    });

    it('addDictionary adds the dictionary only if it is valid', async () => {
        sinon.stub(dictionariesManagerService as any, 'isValidDictionary').returns(true);
        sinon.stub(dictionariesManagerService as any, 'isTitleUnused').returns(true);
        sinon.stub(dictionariesManagerService as any, 'createTrieFromDictionary');

        return dictionariesManagerService
            .addDictionary(validDictionary)
            .then(() => {
                expect(writeFileSyncStub.called).equal(true);
            })
            .catch(() => {
                fail();
            });
    });

    it('removeDictionary should remove the dictionary if it exists', () => {
        dictionariesManagerService['dictionaries'].set('test', mockDictionary);
        dictionariesManagerService.removeDictionary('test');
        expect(unlinkSyncStub.called).equal(true);
        expect(dictionariesManagerService['dictionaries'].get('test')?.deleted).equal(true);
    });

    it('removeDictionary should not remove the default dictionary', () => {
        dictionariesManagerService.removeDictionary(DEFAULT_DICTIONARY_ID);
        expect(dictionariesManagerService['dictionaries'].get(DEFAULT_DICTIONARY_ID)?.deleted).equal(false);
        expect(unlinkSyncStub.called).equal(false);
    });

    it('removeDictionary should not try to remove a dictionary that does not exist', () => {
        dictionariesManagerService.removeDictionary('test');
        expect(unlinkSyncStub.called).equal(false);
    });

    it('resetDictionaries should call removeDictionary on every dictionaryId of dictionaries', async () => {
        const removeDictionaryStub = sinon.stub(dictionariesManagerService, 'removeDictionary');
        await dictionariesManagerService.resetDictionaries();
        expect(removeDictionaryStub.called).equal(true);
    });

    it('addDictionary should not add the dictionary if it is not valid', async () => {
        sinon.stub(dictionariesManagerService as any, 'isValidDictionary').returns(false);

        await dictionariesManagerService
            .addDictionary(invalidDictionary)
            .then(() => {
                fail();
            })
            .catch(() => {
                expect(writeFileSyncStub.called).equal(false);
            });
    });

    it('addDictionary should not add the dictionary if a there is a dictionary with the same title', async () => {
        const usedTitleDictionary: JSON = JSON.parse(
            '{"title": "Dictionnaire-francais","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }',
        );
        sinon.stub(dictionariesManagerService as any, 'isValidDictionary').returns(true);
        sinon.stub(dictionariesManagerService as any, 'isTitleUnused').returns(false);

        await dictionariesManagerService
            .addDictionary(usedTitleDictionary)
            .then(() => {
                fail();
            })
            .catch(() => {
                expect(writeFileSyncStub.called).equal(false);
            });
    });

    it('getDictionariesHeaders should return a DictionaryHeader array containing the titles and description of all the dictionaries', async () => {
        const deletedDictionary: Dictionary = {
            id: defaultDictionaryId,
            title: defaultDictionaryTitle,
            description: 'gottem',
            deleted: true,
            wordsTrie: new Trie(),
        };
        dictionariesManagerService['dictionaries'].set('test', deletedDictionary);
        const expectedDictionariesList: DictionaryHeader[] = [
            { id: DEFAULT_DICTIONARY_ID, title: defaultDictionaryTitle, description: 'A valid dictionary' },
        ];
        const dictionariesList: DictionaryHeader[] = await dictionariesManagerService.getDictionariesHeaders();

        for (let index = 0; index < Math.max(expectedDictionariesList.length, dictionariesList.length); index++) {
            expect(dictionariesList[index].title).to.equal(expectedDictionariesList[index].title);
        }
    });

    it('getDictionaries should return the map with all the existing dictionaries', () => {
        const dictionaries = dictionariesManagerService.getDictionaries();
        for (const dictionary of dictionaries.values()) {
            expect(dictionary.title).to.equal(defaultDictionaryTitle);
        }
    });

    it('createTrieForDictionary() should call fs.readFileSync() as well \
as adding the newly transformed dictionary to dictionaries if nothing threw any error', () => {
        const readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(mockRawDictionaryString);

        dictionariesManagerService['createTrieFromDictionary'](mockRawDictionary.title);

        expect(readFileSyncStub.called).to.equal(true);
        expect(dictionariesManagerService.getDictionaries().get(mockRawDictionary.title)?.title).to.equal(mockRawDictionary.title);
    });

    it('createTrieFromDictionary() should call fs.readFileSync(), but should not \
add a new dictionary to dictionaries if fs.readFileSync() threw error, and should throw an error itself', () => {
        const readFileSyncStub = sinon.stub(fs, 'readFileSync').callsFake(() => {
            throw new Error('test error');
        });

        const createTrieFromDictionary = () => {
            dictionariesManagerService['createTrieFromDictionary'](mockRawDictionary.title);
        };

        expect(createTrieFromDictionary).throws();
        expect(readFileSyncStub.called).to.equal(true);
        expect(dictionariesManagerService.getDictionaries().get(mockRawDictionary.title)).to.equal(undefined);
    });

    it('isTitleUnused should return true the title already exists, and false otherwise', () => {
        const randomTitle = 'rand';
        expect(dictionariesManagerService['isTitleUnused'](defaultDictionaryTitle)).to.equal(false);
        expect(dictionariesManagerService['isTitleUnused'](randomTitle)).to.equal(true);
    });

    it('modifyDictionary should modify a dictionary if the title and the description are valid', async () => {
        const id = 'test';
        const validTitle = 'newTest';
        const validDescription = 'this is a test';
        dictionariesManagerService['dictionaries'].set('test', mockDictionary);
        sinon.stub(dictionariesManagerService as any, 'isTitleUnused').returns(true);
        sinon
            .stub(dictionariesManagerService, 'getDictionary')
            .resolves(
                JSON.parse('{"title": "Dictionnaire-francais","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }'),
            );
        await dictionariesManagerService.modifyDictionary(id, validTitle, validDescription);
        expect(writeFileSyncStub.called).equal(true);
    });

    it('modifyDictionary should not modify a dictionary if the title is invalid', () => {
        const id = 'test';
        const invalidTitle = 'newTestqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
        const validDescription = 'this is a test';
        sinon.stub(dictionariesManagerService as any, 'isTitleUnused').returns(true);
        dictionariesManagerService['dictionaries'].set('test', mockDictionary);
        dictionariesManagerService.modifyDictionary(id, invalidTitle, validDescription);
        expect(writeFileSyncStub.called).equal(false);
    });

    it('modifyDictionary should not modify a dictionary if the id does not match an existing dictionary', () => {
        const invalidId = 'test';
        const validTitle = 'newTest';
        const validDescription = 'this is a test';
        sinon.stub(dictionariesManagerService as any, 'isTitleUnused').returns(true);
        sinon.stub(dictionariesManagerService, 'getDictionary').resolves();
        dictionariesManagerService.modifyDictionary(invalidId, validTitle, validDescription);
        expect(writeFileSyncStub.called).equal(false);
    });

    it('modifyDictionary should not modify a dictionary if the description is invalid', () => {
        const id = 'test';
        const validTitle = 'newTest';
        const invalidDescription = '';
        sinon.stub(dictionariesManagerService as any, 'isTitleUnused').returns(true);
        dictionariesManagerService['dictionaries'].set('test', mockDictionary);
        dictionariesManagerService.modifyDictionary(id, validTitle, invalidDescription);
        expect(writeFileSyncStub.called).equal(false);
    });

    it('modifyDictionary should not modify a dictionary if title is already used', () => {
        const id = 'test';
        const validTitle = 'newTest';
        const validDescription = 'yes';
        sinon.stub(dictionariesManagerService as any, 'isTitleUnused').returns(false);
        dictionariesManagerService['dictionaries'].set('test', mockDictionary);
        dictionariesManagerService.modifyDictionary(id, validTitle, validDescription);
        expect(writeFileSyncStub.called).equal(false);
    });
});
