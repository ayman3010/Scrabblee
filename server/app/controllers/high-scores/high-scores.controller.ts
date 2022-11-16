import { Message } from '@app/message';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { GameType } from '@common/enums/enums';
import { HighScore, HighScoreClient } from '@common/interfaces/high-score';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class HighScoresController {
    router: Router;

    constructor(private highScoresService: HighScoresService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/:gameMode', async (req: Request, res: Response) => {
            this.highScoresService
                .getHighestHighScores(req.params.gameMode as GameType)
                .then((highScores: HighScoreClient[]) => {
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
            this.highScoresService
                .deleteAllHighScores()
                .then(() => {
                    this.highScoresService.populateDefaultHighScores();
                    res.sendStatus(StatusCodes.OK);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    res.status(StatusCodes.BAD_GATEWAY).send(errorMessage);
                });
        });

        this.router.put('/:gameMode/:name/:score', async (req: Request, res: Response) => {
            const highScore: HighScore = { name: req.params.name, gameMode: req.params.gameMode as GameType, score: +req.params.score };
            this.highScoresService
                .modifyHighScore(highScore)
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
