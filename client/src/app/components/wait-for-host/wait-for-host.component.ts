import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameState } from '@common/enums/enums';
import { RoomClient } from '@common/interfaces/room';

@Component({
    selector: 'app-wait-for-host',
    templateUrl: './wait-for-host.component.html',
    styleUrls: ['./wait-for-host.component.scss'],
})
export class WaitForHostComponent implements OnInit {
    currentRoom: RoomClient;
    constructor(public waitingDialog: MatDialogRef<WaitForHostComponent>, private gameManager: GameManagerService, private snackBar: MatSnackBar) {}

    ngOnInit(): void {
        this.gameManager.getRoom();
        this.gameManager.socketHandler();
        this.currentRoom = this.gameManager.currentRoom;
        this.gameManager.gameStateUpdate.asObservable().subscribe(() => {
            this.updateRoom();
        });
    }

    updateRoom(): void {
        this.currentRoom = this.gameManager.currentRoom;
        this.returnToAvailableGames();
    }

    notifyUserRefusal(): void {
        this.snackBar.open("L'hôte vous a refusé la connexion à sa partie", 'Ah mince alors...');
    }

    returnToAvailableGames(): void {
        if (this.currentRoom.gameState === GameState.GameRefused) {
            this.notifyUserRefusal();
            this.gameManager.currentRoom.gameState = GameState.WaitingForGuest;
        }
    }

    returnToMainMenu(): void {
        this.waitingDialog.close();
        this.gameManager.leaveWaitingRoom(this.currentRoom);
    }
}
