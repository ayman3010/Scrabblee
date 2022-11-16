import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { GameHistoryClient } from '@common/interfaces/game-history';

export const EMPTY_MESSAGE = { title: '', body: '' };
@Component({
    selector: 'app-games-history',
    templateUrl: './games-history-dialog.component.html',
    styleUrls: ['./games-history-dialog.component.scss'],
})
export class GamesHistoryDialogComponent implements OnInit {
    displayedColumns: string[] = [
        'dateBegin',
        'gameDuration',
        'firstPlayerName',
        'firstPlayerScore',
        'secondPlayerName',
        'secondPlayerScore',
        'gameMode',
    ];

    gamesHistory: GameHistoryClient[] = [];
    errorMessage: Message = EMPTY_MESSAGE;
    isLoading: boolean = false;

    constructor(private gamesHistoryService: GamesHistoryService, public gameHistoryDialog: MatDialogRef<GamesHistoryDialogComponent>) {}

    async ngOnInit(): Promise<void> {
        this.errorMessage = EMPTY_MESSAGE;
        this.isLoading = true;
        const display = this.gamesHistoryService.getGamesHistory();
        if (display) this.display = await display.toPromise();
        this.isLoading = false;
    }

    async deleteAll(): Promise<void> {
        await this.gamesHistoryService.deleteGamesHistory().toPromise();
        this.ngOnInit();
    }

    set display(display: GameHistoryClient[] | Message) {
        if (Tools.isTypeOf<Message>(display, 'title')) this.errorMessage = display;
        else if (Tools.isListOfType<GameHistoryClient>(display, 'dateBegin')) this.gamesHistory = display;
    }

    get showError(): boolean {
        return !!this.errorMessage.title;
    }

    get showScores(): boolean {
        return !!this.gamesHistory.length;
    }

    close(): void {
        this.gameHistoryDialog.close();
    }
}
