import { Component } from '@angular/core';
import { GameType } from '@common/enums/enums';

@Component({
    selector: 'app-high-scores',
    templateUrl: './high-scores.component.html',
    styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent {
    gameModes: GameType[] = [GameType.CLASSIC, GameType.LOG2990];
}
