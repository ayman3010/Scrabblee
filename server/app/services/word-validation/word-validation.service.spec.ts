/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Trie } from '@app/classes/trie/trie';
import { DictionariesManagerService, Dictionary } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { WordValidationService } from './word-validation.service';

describe('wordValidation Service Tests', () => {
    const basicDictionaryTitle = 'basic';
    const basicDictionaryDescription = 'a description';
    const basicDictionary: Dictionary = {
        id: 'test',
        title: basicDictionaryTitle,
        description: basicDictionaryDescription,
        deleted: false,
        wordsTrie: new Trie(),
    };
    const mockDictionariesList: Map<string, Dictionary> = new Map<string, Dictionary>();
    const mockDictionariesManagerService = {
        getDictionaries: () => {
            return mockDictionariesList;
        },
    };
    const service = new WordValidationService(mockDictionariesManagerService as unknown as DictionariesManagerService);

    Object.defineProperty(service, 'trieDictionaryPath', {
        get() {
            return './tests/assets/trie/';
        },
    });

    beforeEach(() => {
        mockDictionariesList.clear();
    });

    afterEach(() => {
        sinon.restore();
    });
    it('inDictionary() should return false if there is no dictionary by that name that has been initialized', () => {
        const wordToSearch = 'trie';
        expect(service.inDictionary(basicDictionaryTitle, wordToSearch)).to.equal(false);
    });

    it("inDictionary() should call search on the dictionary's wordsTrie and return true for a word in the dictionary", () => {
        mockDictionariesList.set(basicDictionaryTitle, basicDictionary);
        const word = 'louper';

        const searchStub = sinon.stub(basicDictionary.wordsTrie, 'search').returns(true);

        expect(service.inDictionary(basicDictionaryTitle, word)).equal(true);
        expect(searchStub.called).to.equal(true);
    });

    it("inDictionary() should call search on the dictionary's wordsTrie return false for a word that is not in the dictionary", () => {
        mockDictionariesList.set(basicDictionaryTitle, basicDictionary);
        const word = 'a454a';

        const searchStub = sinon.stub(basicDictionary.wordsTrie, 'search').returns(false);

        expect(service.inDictionary(basicDictionaryTitle, word)).equal(false);
        expect(searchStub.called).to.equal(true);
    });
});
