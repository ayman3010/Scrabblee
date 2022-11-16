import { Component, Input, OnInit } from '@angular/core';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { GameType } from '@common/enums/enums';
import { HighScoreClient } from '@common/interfaces/high-score';

export const MEDALS: string[] = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

@Component({
    selector: 'app-high-scores-category',
    templateUrl: './high-scores-category.component.html',
    styleUrls: ['./high-scores-category.component.scss'],
})
export class HighScoresCategoryComponent implements OnInit {
    @Input() gameMode: GameType;

    displayedColumns: string[] = ['medal', 'score', 'names'];

    highScores: HighScoreClient[];
    errorMessage: Message;

    constructor(private highScoresService: HighScoresService) {}

    async ngOnInit(): Promise<void> {
        const display = this.highScoresService.getHighScores(this.gameMode);
        if (display) this.display = await display.toPromise();
    }

    set display(display: HighScoreClient[] | Message) {
        if (Tools.isTypeOf<Message>(display, 'title')) this.errorMessage = display;
        else if (Tools.isListOfType<HighScoreClient>(display, 'score')) this.highScores = display;
    }

    getMedal(place: number): string {
        return place < 3 ? MEDALS[place] : '';
    }

    get showError(): boolean {
        return !!this.errorMessage;
    }

    get showScores(): boolean {
        return !!this.highScores;
    }

    get isLoading(): boolean {
        return !this.showError && !this.showScores;
    }
}
