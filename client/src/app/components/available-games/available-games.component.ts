import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JoinGameDialogComponent } from '@app/components/join-game-dialog/join-game-dialog.component';
import { WaitForHostComponent } from '@app/components/wait-for-host/wait-for-host.component';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameState, GameType } from '@common/enums/enums';
import { PlayerNameData } from '@common/interfaces/interfaces';
import { RoomClient } from '@common/interfaces/room';
@Component({
    selector: 'app-available-games',
    templateUrl: './available-games.component.html',
    styleUrls: ['./available-games.component.scss'],
})
export class AvailableGamesComponent implements OnInit {
    @Output() gameStarting: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() gameType: GameType;

    rooms: RoomClient[] = [];
    playerNameData: PlayerNameData = { playerName: '', validName: false };
    displayedColumns: string[] = ['hostName', 'turnDuration', 'dictionary'];

    constructor(public dialog: MatDialog, private gameManager: GameManagerService) {
        this.gameManager.availableRoomsEvent.asObservable().subscribe(() => {
            this.rooms = this.filterRooms();
        });
    }

    ngOnInit(): void {
        this.gameManager.connectPlayer();
        this.gameManager.socketHandler();
        this.gameManager.listAvailableRooms();
    }

    filterRooms(): RoomClient[] {
        const rooms: RoomClient[] = [];
        for (const room of this.gameManager.availableRooms) {
            if (this.gameType === room.gameOptions.gameType) {
                rooms.push(room);
            }
        }
        return rooms;
    }

    randomRoomPlacement(): void {
        const randomRoomIndex = Math.floor(Math.random() * this.rooms.length);
        if (this.rooms.length > 0) {
            this.openDialog(this.rooms[randomRoomIndex]);
        }
    }

    openDialog(room: RoomClient): void {
        const nameInputDialog = this.dialog.open(JoinGameDialogComponent, {
            data: { playerName: this.playerNameData.playerName, validName: false },
        });

        nameInputDialog.afterClosed().subscribe((result: PlayerNameData) => {
            if (result.validName && result.playerName !== room.hostPlayer.name) {
                this.doAfterNameSubmitted(room, result);
            }
        });
    }

    private doAfterNameSubmitted(room: RoomClient, result: PlayerNameData): void {
        this.playerNameData.playerName = result.playerName;
        room.guestPlayer.name = this.playerNameData.playerName;
        this.gameManager.joinRoom(room, result.playerName);
        const waitingDialog = this.dialog.open(WaitForHostComponent);

        waitingDialog.afterClosed().subscribe(() => {
            if (this.gameManager.currentRoom?.gameState !== GameState.GameAccepted) {
                this.gameManager.leaveWaitingRoom(this.gameManager.currentRoom);
            }
        });

        this.gameManager.gameStateUpdate.asObservable().subscribe((state: GameState) => {
            if (state === GameState.GameRefused || state === GameState.GameAccepted) {
                waitingDialog.close();
                if (state === GameState.GameAccepted) this.gameStarting.emit(true);
            }
        });
    }
}
