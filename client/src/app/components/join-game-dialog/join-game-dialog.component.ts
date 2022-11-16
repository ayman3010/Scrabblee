import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tools } from '@app/classes/tools/tools';
import { PlayerNameData } from '@common/interfaces/interfaces';

@Component({
    selector: 'app-join-game-dialog',
    templateUrl: './join-game-dialog.component.html',
    styleUrls: ['./join-game-dialog.component.scss'],
})
export class JoinGameDialogComponent {
    constructor(public nameInputDialog: MatDialogRef<JoinGameDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: PlayerNameData) {}

    onCancelClick(): void {
        this.nameInputDialog.close(this.data);
    }

    onConfirmClick(): void {
        if (this.verifyName()) {
            this.nameInputDialog.close(this.data);
        }
    }

    verifyName(): boolean {
        if (!Tools.playerNameSizeCheck(this.data.playerName)) {
            this.data.validName = false;
            return false;
        }
        this.data.validName = true;
        return true;
    }
}
