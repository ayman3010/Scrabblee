import { DICTIONARY_CONFLICT_ERROR_MESSAGE, DICTIONARY_FORMAT_ERROR_MESSAGE } from '@app/classes/constants/database-constant';
import {
    BASE_DICTIONARY_PATH,
    DICTIONARY_FILE_EXTENSION,
    DICTIONARY_FILE_EXTENSION_SIZE,
    DICTIONARY_SCHEMA,
} from '@app/classes/constants/dictionary-constant';
import { Trie } from '@app/classes/trie/trie';
import { DEFAULT_DICTIONARY_ID, MAX_DESCRIPTION_DICTIONARY_LENGTH, MAX_TITLE_DICTIONARY_LENGTH } from '@common/constants/dictionary-constants';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import Ajv from 'ajv';
import * as fs from 'fs';
import { resolve } from 'promise';
import { Service } from 'typedi';

export interface RawDictionary {
    title: string;
    description: string;
    words: string[];
}

export interface Dictionary {
    id: string;
    title: string;
    description: string;
    deleted: boolean;
    wordsTrie: Trie;
}

@Service()
export class DictionariesManagerService {
    private dictionaries: Map<string, Dictionary>;

    constructor() {
        this.dictionaries = new Map<string, Dictionary>();
        this.loadAllAvailableDictionaries();
    }

    async addDictionary(dictionaryFile: JSON): Promise<void> {
        if (!this.isValidDictionary(dictionaryFile)) throw new Error(DICTIONARY_FORMAT_ERROR_MESSAGE);

        const dictionary: Dictionary = JSON.parse(JSON.stringify(dictionaryFile));
        dictionary.id = dictionary.title;

        if (!this.isTitleUnused(dictionary.title)) throw new Error(DICTIONARY_CONFLICT_ERROR_MESSAGE);

        fs.writeFileSync('./assets/' + dictionary.id + '.json', JSON.stringify(dictionaryFile));
        this.createTrieFromDictionary(dictionary.id);
    }

    async removeDictionary(dictionaryId: string): Promise<void> {
        if (dictionaryId === DEFAULT_DICTIONARY_ID) return;
        const toFakeDelete: Dictionary | undefined = this.dictionaries.get(dictionaryId);
        if (toFakeDelete) {
            toFakeDelete.deleted = true;
            fs.unlinkSync('./assets/' + dictionaryId + '.json');
        }
    }

    async resetDictionaries(): Promise<void> {
        for (const dictionaryId of this.dictionaries.keys()) {
            this.removeDictionary(dictionaryId);
        }
    }

    async getDictionariesHeaders(): Promise<DictionaryHeader[]> {
        const dictionariesHeaders: DictionaryHeader[] = [];
        let index = 0;
        for (const dictionary of this.dictionaries.values()) {
            if (!dictionary.deleted)
                dictionariesHeaders[index++] = { id: dictionary.id, title: dictionary.title, description: dictionary.description };
        }
        return resolve(dictionariesHeaders);
    }

    getDictionaries(): Map<string, Dictionary> {
        return this.dictionaries;
    }

    async modifyDictionary(dictionaryId: string, newTitle: string, newDescription: string): Promise<boolean> {
        if (
            newTitle.length <= MAX_TITLE_DICTIONARY_LENGTH &&
            newTitle.length > 0 &&
            newDescription.length <= MAX_DESCRIPTION_DICTIONARY_LENGTH &&
            newDescription.length > 0
        ) {
            if (!this.isTitleUnused(newTitle)) throw new Error(DICTIONARY_CONFLICT_ERROR_MESSAGE);
            const dictionary = this.dictionaries.get(dictionaryId);
            if (dictionary) {
                dictionary.title = newTitle;
                dictionary.description = newDescription;
                this.dictionaries.set(dictionaryId, dictionary);

                const fullDictionary: RawDictionary = JSON.parse(JSON.stringify(await this.getDictionary(dictionaryId)));
                fullDictionary.title = newTitle;
                fullDictionary.description = newDescription;
                fs.writeFileSync('./assets/' + dictionary.id + '.json', JSON.stringify(fullDictionary));
                return true;
            }
        }
        return false;
    }

    async getDictionary(dictionaryId: string): Promise<JSON> {
        const rawDictionaryPath = BASE_DICTIONARY_PATH + dictionaryId + DICTIONARY_FILE_EXTENSION;
        const dictionary = fs.readFileSync(rawDictionaryPath, 'utf8');
        const dictionaryFile: JSON = JSON.parse(dictionary);
        return dictionaryFile;
    }

    private loadAllAvailableDictionaries(): void {
        fs.readdirSync('./assets/').forEach((file) => {
            this.createTrieFromDictionary(file.substring(0, file.length - DICTIONARY_FILE_EXTENSION_SIZE));
        });
    }

    private createTrieFromDictionary(id: string): void {
        try {
            const rawDictionaryPath = BASE_DICTIONARY_PATH + id + DICTIONARY_FILE_EXTENSION;

            const stringRead = fs.readFileSync(rawDictionaryPath, 'utf8');
            const rawDictionary: RawDictionary = JSON.parse(stringRead);
            const trie = new Trie();

            for (const word of rawDictionary.words) {
                trie.insert(word);
            }

            const dictionaryInTrie: Dictionary = {
                id,
                title: rawDictionary.title,
                description: rawDictionary.description,
                deleted: false,
                wordsTrie: trie,
            };
            this.dictionaries.set(id, dictionaryInTrie);
        } catch (error) {
            throw new Error('An unexpected error happened during the conversion of the dictionary to a trie. Additional details: ' + error);
        }
    }

    private isValidDictionary(dictionary: JSON): boolean {
        const ajv = new Ajv();
        const validate = ajv.compile(DICTIONARY_SCHEMA);
        return validate(dictionary);
    }

    private isTitleUnused(title: string): boolean {
        for (const dictionary of this.dictionaries.values()) {
            if (dictionary.title === title && !dictionary.deleted) {
                return false;
            }
        }
        return true;
    }
}
