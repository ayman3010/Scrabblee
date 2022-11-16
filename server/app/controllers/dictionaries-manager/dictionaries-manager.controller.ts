import { DICTIONARY_CONFLICT_ERROR_MESSAGE, DICTIONARY_FORMAT_ERROR_MESSAGE } from '@app/classes/constants/database-constant';
import { Message } from '@app/message';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class DictionariesManagerController {
    router: Router;
    constructor(private dictionariesManager: DictionariesManagerService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/dictionariesList', async (req: Request, res: Response) => {
            this.dictionariesManager
                .getDictionariesHeaders()
                .then((dictionariesHeaders: DictionaryHeader[]) => {
                    res.status(StatusCodes.OK).send(dictionariesHeaders);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    res.status(StatusCodes.BAD_GATEWAY).send(errorMessage);
                });
        });

        this.router.get('/:dictionaryId', async (req: Request, res: Response) => {
            const dictionaryId: string = req.params.dictionaryId;
            this.dictionariesManager
                .getDictionary(dictionaryId)
                .then((dictionaryFile: JSON) => {
                    res.status(StatusCodes.OK).json(dictionaryFile);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    res.status(StatusCodes.BAD_GATEWAY).send(errorMessage);
                });
        });

        this.router.post('/addDictionary', async (req: Request, res: Response) => {
            const dictionary: JSON = req.body.dictionary;
            this.dictionariesManager
                .addDictionary(dictionary)
                .then(() => {
                    res.sendStatus(StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    let errorStatus = StatusCodes.BAD_GATEWAY;
                    if (errorMessage.body === DICTIONARY_CONFLICT_ERROR_MESSAGE) errorStatus = StatusCodes.CONFLICT;
                    else if (errorMessage.body === DICTIONARY_FORMAT_ERROR_MESSAGE) errorStatus = StatusCodes.UNSUPPORTED_MEDIA_TYPE;
                    res.status(errorStatus).send(errorMessage);
                });
        });

        this.router.patch('/modifyDictionary/:dictionaryId', async (req: Request, res: Response) => {
            const dictionaryId: string = req.params.dictionaryId;
            const dictionaryTitle: string = req.body.title;
            const dictionaryDescription: string = req.body.description;

            this.dictionariesManager
                .modifyDictionary(dictionaryId, dictionaryTitle, dictionaryDescription)
                .then(() => {
                    res.sendStatus(StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    const errorStatus = errorMessage.body === DICTIONARY_CONFLICT_ERROR_MESSAGE ? StatusCodes.CONFLICT : StatusCodes.BAD_GATEWAY;
                    res.status(errorStatus).send(errorMessage);
                });
        });

        this.router.delete('/:dictionaryId', async (req: Request, res: Response) => {
            const dictionaryId: string = req.params.dictionaryId;
            this.dictionariesManager
                .removeDictionary(dictionaryId)
                .then(() => {
                    res.sendStatus(StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    res.status(StatusCodes.BAD_GATEWAY).send(errorMessage);
                });
        });

        this.router.delete('/', async (req: Request, res: Response) => {
            this.dictionariesManager
                .resetDictionaries()
                .then(() => {
                    res.sendStatus(StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    res.status(StatusCodes.BAD_GATEWAY).send(errorMessage);
                });
        });
    }
}
