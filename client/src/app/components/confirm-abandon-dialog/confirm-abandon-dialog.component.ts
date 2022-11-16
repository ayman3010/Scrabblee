import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-abandon-dialog',
    templateUrl: './confirm-abandon-dialog.component.html',
    styleUrls: ['./confirm-abandon-dialog.component.scss'],
})
export class ConfirmAbandonDialogComponent {
    constructor(public nameInputDialog: MatDialogRef<ConfirmAbandonDialogComponent>) {}

    onCancelClick(): void {
        this.nameInputDialog.close(false);
    }

    onConfirmClick(): void {
        this.nameInputDialog.close(true);
    }
}
