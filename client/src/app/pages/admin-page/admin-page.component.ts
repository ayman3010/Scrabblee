import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AdminDictionaryDialogComponent } from '@app/components/admin-dictionary-dialog/admin-dictionary-dialog.component';
import { AdminVirtualPlayerDialogComponent } from '@app/components/admin-virtual-player-dialog/admin-virtual-player-dialog.component';
import { GamesHistoryDialogComponent } from '@app/components/games-history/games-history-dialog.component';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-vitual-player.service';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
@Component({
    selector: 'app-admin-games',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    @Input() dictionariesClick: boolean;
    @Input() virtualPlayersClick: boolean;
    @Input() gameHistoryClick: boolean;
    @Input() resetClick: boolean;

    readonly pageTitle: string = 'Welcome Admin';

    adminCommandOptions: FormGroup;

    dictionaries: DictionaryHeader[];
    editDictionary: string;

    constructor(
        public dialog: MatDialog,
        private adminVirtualPlayerService: AdminVirtualPlayerService,
        private gamesHistoryService: GamesHistoryService,
        private highScoreService: HighScoresService,
        private dictionaryManagerService: DictionariesManagerService,
    ) {}

    openDictionaryDialog(): void {
        this.dialog.open(AdminDictionaryDialogComponent, {});
    }

    openGameHistoryDialog(): void {
        this.dialog.open(GamesHistoryDialogComponent, {});
    }

    openVirtualPlayerDialog(): void {
        this.dialog.open(AdminVirtualPlayerDialogComponent, {});
    }

    async resetHighScores(): Promise<void> {
        await this.highScoreService.deleteAllHighScores().toPromise();
    }

    async resetVirtualPlayers(): Promise<void> {
        await this.adminVirtualPlayerService.deleteAllVirtualPlayer().toPromise();
    }

    async resetGameHistory(): Promise<void> {
        await this.gamesHistoryService.deleteGamesHistory().toPromise();
    }

    async resetDictionaries(): Promise<void> {
        await this.dictionaryManagerService.resetDictionaries().toPromise();
    }
}
