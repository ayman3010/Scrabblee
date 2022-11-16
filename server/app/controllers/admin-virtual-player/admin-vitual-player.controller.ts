import { NAME_CONFLICT_ERROR_MESSAGE } from '@app/classes/constants/database-constant';
import { Message } from '@app/message';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-virtual-player.service';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AdminVirtualPlayerController {
    router: Router;

    constructor(private adminVirtualPlayerService: AdminVirtualPlayerService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/:virtualPlayerDifficulty', async (req: Request, res: Response) => {
            this.adminVirtualPlayerService
                .getVirtualPlayers(req.params.virtualPlayerDifficulty as AiDifficulty)
                .then((virtualPlayers: VirtualPlayer[]) => {
                    res.status(StatusCodes.OK).json(virtualPlayers);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    res.status(StatusCodes.BAD_GATEWAY).send(errorMessage);
                });
        });

        this.router.post('/:virtualPlayerDifficulty', async (req: Request, res: Response) => {
            const virtualPlayer: VirtualPlayer = req.body.virtualPlayer;
            this.adminVirtualPlayerService
                .addVirtualPlayer(virtualPlayer)
                .then(() => {
                    res.sendStatus(StatusCodes.OK);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    const errorStatus = errorMessage.body === NAME_CONFLICT_ERROR_MESSAGE ? StatusCodes.CONFLICT : StatusCodes.BAD_GATEWAY;
                    res.status(errorStatus).send(errorMessage);
                });
        });

        this.router.delete('/', async (req: Request, res: Response) => {
            this.adminVirtualPlayerService
                .deleteAllVirtualPlayer()
                .then(() => {
                    this.adminVirtualPlayerService.populateVirtualPlayers();
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

        this.router.delete('/:virtualPlayerDifficulty', async (req: Request, res: Response) => {
            const virtualPlayer: VirtualPlayer = {
                name: req.body.name,
                virtualPlayerDifficulty: req.body.virtualPlayerDifficulty as AiDifficulty,
            };
            this.adminVirtualPlayerService
                .deleteVirtualPlayer(virtualPlayer)
                .then(() => {
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

        this.router.put('/:virtualPlayerDifficulty', async (req: Request, res: Response) => {
            const newVirtualPLayer: VirtualPlayer = req.body.updateDataList[0];
            const oldVirtualPLayer: VirtualPlayer = req.body.updateDataList[1];
            this.adminVirtualPlayerService
                .modifyVirtualPlayer(newVirtualPLayer, oldVirtualPLayer)
                .then(() => {
                    res.sendStatus(StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: error.message as string,
                    };
                    const errorStatus = errorMessage.body === NAME_CONFLICT_ERROR_MESSAGE ? StatusCodes.CONFLICT : StatusCodes.BAD_GATEWAY;
                    res.status(errorStatus).send(errorMessage);
                });
        });
    }
}
