import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { Service } from 'typedi';

@Service()
export class WordValidationService {
    constructor(private dictionaryManager: DictionariesManagerService) {}

    inDictionary(dictionaryId: string, word: string): boolean {
        return !!this.dictionaryManager.getDictionaries().get(dictionaryId)?.wordsTrie.search(word);
    }
}
