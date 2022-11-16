import { Component } from '@angular/core';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
export const EMPTY_MESSAGE = { title: '', body: '' };

@Component({
    selector: 'app-admin-vp-dialog',
    templateUrl: './admin-virtual-player-dialog.component.html',
    styleUrls: ['./admin-virtual-player-dialog.component.scss'],
})
export class AdminVirtualPlayerDialogComponent {
    aiDifficulty: AiDifficulty[] = [AiDifficulty.BEGINNER, AiDifficulty.EXPERT];
}
