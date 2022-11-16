import { Message } from '@app/message';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { GameHistoryClient } from '@common/interfaces/game-history';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamesHistoryController {
    router: Router;

    constructor(private gamesHistoryService: GamesHistoryService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            this.gamesHistoryService
                .getGamesHistory()
                .then((highScores: GameHistoryClient[]) => {
                    res.status(StatusCodes.OK).json(highScores);
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
            this.gamesHistoryService
                .deleteGamesHistory()
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
