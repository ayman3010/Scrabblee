import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameState } from '@common/enums/enums';
import { RoomClient } from '@common/interfaces/room';

@Component({
    selector: 'app-waiting-room-dialog',
    templateUrl: './waiting-room-dialog.component.html',
    styleUrls: ['./waiting-room-dialog.component.scss'],
})
export class WaitingRoomDialogComponent implements OnInit {
    room: RoomClient;
    roomKey: string;
    isJoined: boolean;
    constructor(public waitingDialog: MatDialogRef<WaitingRoomDialogComponent>, private gameManager: GameManagerService) {
        this.gameManager.roomEvent.asObservable().subscribe((room: RoomClient) => {
            if (room) this.room = room;
            this.isJoined = this.roomIsJoined();
        });
        this.isJoined = false;
    }

    ngOnInit(): void {
        this.gameManager.getRoom();
        this.gameManager.socketHandler();
        this.room = this.gameManager.currentRoom;
    }

    roomIsJoined(): boolean {
        return this.room?.gameState === GameState.GuestJoined;
    }

    proceedToGame(): void {
        if (this.room.gameState === GameState.GuestJoined) {
            this.waitingDialog.close();
            this.gameManager.acceptGame(this.room);
        }
    }

    refuseGame(): void {
        this.gameManager.refuseGame(this.room);
        this.gameManager.currentRoom.gameState = GameState.WaitingForGuest;
    }

    abandon(): void {
        this.waitingDialog.close();
        this.gameManager.abandonWaiting();
    }

    convertToSinglePlayer(): void {
        this.waitingDialog.close();
        this.room.gameOptions.singlePlayer = true;
        this.gameManager.acceptGame(this.room);
    }
}
