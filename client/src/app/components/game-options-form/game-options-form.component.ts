import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AiDifficulty } from '@app/classes/ai-difficulty.enum';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { DEFAULT_GAME_OPTIONS } from '@common/constants/options-constants';
import { GameType } from '@common/enums/enums';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';

const DURATION_MINIMUM = 30;
const DURATION_MAXIMUM = 300;
const STEP = 30;

@Component({
    selector: 'app-game-options-form',
    templateUrl: './game-options-form.component.html',
    styleUrls: ['./game-options-form.component.scss'],
})
export class GameOptionsFormComponent implements OnInit {
    @Input() singlePlayer: boolean;
    @Input() gameType: GameType;

    aiDifficulty: typeof AiDifficulty;

    gameOptionsForm: FormGroup;

    dictionaries: DictionaryHeader[];

    constructor(
        private formBuilder: FormBuilder,
        public gameOptionsDialog: MatDialogRef<GameOptionsFormComponent>,
        private dictionariesManager: DictionariesManagerService,
    ) {
        this.singlePlayer = false;
        this.gameType = GameType.CLASSIC;
        this.aiDifficulty = AiDifficulty;
        this.dictionaries = [DEFAULT_GAME_OPTIONS.dictionary];
        this.gameOptionsForm = this.formBuilder.group({
            name: DEFAULT_GAME_OPTIONS.name,
            aiDifficulty: DEFAULT_GAME_OPTIONS.aiDifficulty,
            turnDuration: DEFAULT_GAME_OPTIONS.turnDuration,
            dictionary: DEFAULT_GAME_OPTIONS.dictionary,
            singlePlayer: this.singlePlayer,
        });
    }

    async ngOnInit() {
        this.dictionariesManager.getDictionariesHeaders().subscribe((dictionariesList: DictionaryHeader[] | Message) => {
            if (Tools.isListOfType<DictionaryHeader>(dictionariesList, 'id')) this.dictionaries = dictionariesList;
        });
    }

    onSubmit(): void {
        if (!Tools.playerNameSizeCheck(this.gameOptionsForm.value.name)) return;

        this.gameOptionsForm.value.singlePlayer = this.singlePlayer;
        this.gameOptionsDialog.close(this.gameOptionsForm);
    }

    getTurnDurations(): number[] {
        return Tools.range(DURATION_MINIMUM, DURATION_MAXIMUM, STEP);
    }
}
