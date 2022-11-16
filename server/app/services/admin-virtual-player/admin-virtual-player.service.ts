import { DATABASE_COLLECTION_VIRTUAL_PLAYER, NAME_CONFLICT_ERROR_MESSAGE } from '@app/classes/constants/database-constant';
import { DatabaseService } from '@app/services/database/database.service';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Collection, Filter, UpdateFilter } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

@Service()
export class AdminVirtualPlayerService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<VirtualPlayer> {
        return this.databaseService.database.collection(DATABASE_COLLECTION_VIRTUAL_PLAYER);
    }

    async getVirtualPlayers(aiDifficulty: AiDifficulty): Promise<VirtualPlayer[]> {
        return this.collection
            .find({ virtualPlayerDifficulty: aiDifficulty })
            .toArray()
            .then((virtualPlayers: VirtualPlayer[]) => {
                return virtualPlayers;
            });
    }

    async addVirtualPlayer(virtualPlayer: VirtualPlayer): Promise<void> {
        if ((await this.collection.countDocuments({ name: virtualPlayer.name })) > 0) {
            throw new Error(NAME_CONFLICT_ERROR_MESSAGE);
        }
        return this.collection
            .insertOne(virtualPlayer)
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to create document');
            });
    }

    async deleteVirtualPlayer(virtualPlayer: VirtualPlayer): Promise<void> {
        return this.collection
            .deleteOne(virtualPlayer)
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to delete documents of collection');
            });
    }

    async deleteAllVirtualPlayer(): Promise<void> {
        return this.collection
            .deleteMany({})
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to delete documents of collection');
            });
    }

    async modifyVirtualPlayer(newVirtualPlayer: VirtualPlayer, virtualPLayer: VirtualPlayer): Promise<void> {
        if ((await this.collection.countDocuments({ name: newVirtualPlayer.name })) > 0) {
            throw new Error(NAME_CONFLICT_ERROR_MESSAGE);
        }
        const filterQuery: Filter<VirtualPlayer> = { name: virtualPLayer.name, virtualPlayerDifficulty: virtualPLayer.virtualPlayerDifficulty };
        const updateQuery: UpdateFilter<VirtualPlayer> = {
            $set: { name: newVirtualPlayer.name },
        };
        return this.collection
            .updateOne(filterQuery, updateQuery)
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to update document');
            });
    }

    async populateVirtualPlayers(): Promise<void> {
        await this.databaseService.populateVirtualPlayers();
    }
}
