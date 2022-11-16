import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameType } from '@common/enums/enums';

@Component({
    selector: 'app-game-options-elements',
    templateUrl: './game-options-elements.component.html',
    styleUrls: ['./game-options-elements.component.scss'],
})
export class GameOptionsElementsComponent {
    constructor(public gameOptionsDialog: MatDialogRef<GameOptionsElementsComponent>, @Inject(MAT_DIALOG_DATA) public gameType: GameType) {}

    close(): void {
        this.gameOptionsDialog.close();
    }
}
