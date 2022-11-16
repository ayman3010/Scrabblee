import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TO_HOME } from '@app/classes/constants/routing-constants';
import { ConfirmAbandonDialogComponent } from '@app/components/confirm-abandon-dialog/confirm-abandon-dialog.component';
import { BoardInputHandlerService } from '@app/services/board-input-handler/board-input-handler.service';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { NUMBER_OF_PRIVATE_OBJECTIVES, NUMBER_OF_PUBLIC_OBJECTIVES } from '@common/constants/objective-constants';
import { GameState } from '@common/enums/enums';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { ObjectiveClient } from '@common/interfaces/objective-client';
import { Player } from '@common/interfaces/player';
import { RoomClient } from '@common/interfaces/room';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    readonly numberOfPublicObjectives = NUMBER_OF_PUBLIC_OBJECTIVES;
    readonly numberOfPrivateObjectives = NUMBER_OF_PRIVATE_OBJECTIVES;

    currentRoom: RoomClient;
    playerId: string;
    timer: number;
    isTurn: boolean;

    currentPlayer: Player;
    objectives: ObjectiveClient[];

    gameState: typeof GameState = GameState;

    constructor(
        private chatBoxManager: ChatboxManagerService,
        private readonly boardService: BoardInputHandlerService,
        private router: Router,
        public dialog: MatDialog,
        private clearBoardDetector: ClearBoardSelectionService,
    ) {
        this.chatBoxManager.roomEvent.asObservable().subscribe(() => this.updateInfo());
        this.chatBoxManager.timerEvent.asObservable().subscribe((newTime: number) => {
            this.timer = newTime;
        });
        this.playerId = '';
        this.isTurn = false;
        this.timer = 0;
    }

    ngOnInit(): void {
        this.chatBoxManager.init();
        this.chatBoxManager.handleSockets();
        this.updateInfo();
    }

    updateInfo(): void {
        this.playerId = this.chatBoxManager.playerId;
        this.currentPlayer = this.chatBoxManager.currentPlayer;
        this.isTurn = this.chatBoxManager.currentPlayer?.isTurn;
        this.currentRoom = this.chatBoxManager.currentRoom;
        this.timer = this.chatBoxManager.timer;
    }

    skipTurn(): void {
        this.chatBoxManager.skipTurn();
    }

    abandonGame(): void {
        if (this.currentPlayer) this.chatBoxManager.gameManager.abandonGame(this.currentPlayer.name);
        this.router.navigate([TO_HOME]);
    }

    quitGame(): void {
        if (this.currentRoom?.gameState === GameState.GameAbandoned) {
            this.router.navigate([TO_HOME]);
        }
    }

    openAbandonDialog(): void {
        const confirmAbandonDialog = this.dialog.open(ConfirmAbandonDialogComponent);
        confirmAbandonDialog.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.abandonGame();
            }
        });
    }

    mouseDetect(): void {
        this.clearBoardDetector.notify();
    }

    generateCongratulations(): string {
        let message = '';
        if (!this.currentRoom) return message;

        if (this.currentRoom.hostPlayer.abandoned || this.currentRoom.guestPlayer.abandoned)
            return this.currentPlayer.name + ' a gagné avec ' + this.currentPlayer.points + ' points! Bravo!';

        const tie = this.currentRoom.hostPlayer.points === this.currentRoom.guestPlayer.points;
        const bestScore = this.getWinnerPoints(this.currentRoom.hostPlayer, this.currentRoom.guestPlayer);

        if (this.currentRoom.hostPlayer.points === bestScore) message += this.currentRoom.hostPlayer.name;
        if (tie) message += ' et ';
        if (this.currentRoom.guestPlayer.points === bestScore) message += this.currentRoom.guestPlayer.name;

        message += tie ? ' ont' : ' a';
        message += ' gagné avec ' + bestScore + ' points! Bravo!';

        return message;
    }

    isExpert(): boolean {
        return this.currentRoom.gameOptions.aiDifficulty === AiDifficulty.EXPERT;
    }

    resizeText(newTextSize: number): void {
        this.boardService.textSize = newTextSize;
    }

    get showObjectives(): boolean {
        return !!this.currentRoom?.objectives?.length;
    }

    get privateObjectivesHost(): ObjectiveClient[] {
        return this.currentRoom.objectives[this.numberOfPublicObjectives].owners[0].name === this.currentRoom.hostPlayer.name
            ? this.currentRoom.objectives.slice(this.numberOfPublicObjectives, this.numberOfPrivateObjectives + this.numberOfPublicObjectives)
            : this.currentRoom.objectives.slice(this.numberOfPrivateObjectives + this.numberOfPublicObjectives);
    }

    get privateObjectivesGuest(): ObjectiveClient[] {
        return this.currentRoom.objectives[this.numberOfPublicObjectives].owners[0].name === this.currentRoom.hostPlayer.name
            ? this.currentRoom.objectives.slice(this.numberOfPrivateObjectives + this.numberOfPublicObjectives)
            : this.currentRoom.objectives.slice(this.numberOfPublicObjectives, this.numberOfPrivateObjectives + this.numberOfPublicObjectives);
    }

    private getWinnerPoints(firstPlayer: Player, secondPlayer: Player): number {
        return firstPlayer.points >= secondPlayer.points ? firstPlayer.points : secondPlayer.points;
    }
}
