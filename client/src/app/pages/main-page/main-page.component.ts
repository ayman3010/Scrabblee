import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GameOptionsElementsComponent } from '@app/components/game-options-elements/game-options-elements.component';
import { HighScoresComponent } from '@app/components/high-scores/high-scores.component';
import { WaitingRoomDialogComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { DEFAULT_GAME_OPTIONS } from '@common/constants/options-constants';
import { GameState, GameType } from '@common/enums/enums';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    readonly gameTypes: typeof GameType = GameType;
    gameType: GameType = GameType.CLASSIC;

    constructor(public dialog: MatDialog, private gameManager: GameManagerService) {}

    selectGameType(typeChosen: GameType): void {
        this.gameType = typeChosen;

        const gameOptionsDialog = this.dialog.open(GameOptionsElementsComponent, {
            data: this.gameType,
        });

        gameOptionsDialog.afterClosed().subscribe((result: FormGroup) => {
            if (!result) return;
            const gameOptions = { ...DEFAULT_GAME_OPTIONS };
            gameOptions.turnDuration = result.value.turnDuration;
            gameOptions.singlePlayer = result.value.singlePlayer;
            gameOptions.aiDifficulty = result.value.aiDifficulty;
            gameOptions.gameType = this.gameType;
            gameOptions.dictionary = result.value.dictionary;
            this.gameManager.connectPlayer();
            this.gameManager.createRoom(result.value.name, gameOptions);
            if (!gameOptions.singlePlayer) this.openWaitingRoomDialog();
        });
    }

    async displayHighScores(): Promise<void> {
        this.dialog.open(HighScoresComponent);
    }

    openWaitingRoomDialog(): void {
        const waitingRoomDialog = this.dialog.open(WaitingRoomDialogComponent);

        waitingRoomDialog.afterClosed().subscribe(() => {
            if (this.gameManager.currentRoom?.gameState !== GameState.GameAccepted) {
                this.gameManager.abandonWaiting();
            }
        });
    }
}
