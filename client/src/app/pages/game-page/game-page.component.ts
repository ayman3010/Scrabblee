import { Component, OnInit } from '@angular/core';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameState } from '@common/enums/enums';
import { RoomClient } from '@common/interfaces/room';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameOver: boolean = false;

    constructor(private gameManager: GameManagerService) {}

    ngOnInit(): void {
        this.gameManager.connectPlayer();
        this.gameManager.roomEvent.asObservable().subscribe((room: RoomClient) => {
            if (room.gameState === GameState.GameOver) this.gameOver = true;
        });
    }
}
