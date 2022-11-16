export const DICTIONARY_SCHEMA = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1, maxLength: 40, pattern: '^[a-zA-Z0-9]+((-[a-zA-Z0-9]+)*)?$' },
        description: { type: 'string', minLength: 1, maxLength: 256 },
        words: { type: 'array', minItems: 1, uniqueItems: true },
        id: { type: 'string' },
    },
    required: ['title', 'description', 'words'],
    additionalProperties: false,
};

export const DEFAULT_DICTIONARY_ID = 'DEFAULT';
export const DICTIONARY_FILE_EXTENSION = '.json';
export const BASE_DICTIONARY_PATH = './assets/';
export const DICTIONARY_FILE_EXTENSION_SIZE = 5;
