import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-vitual-player.service';
import { DEFAULT_VIRTUAL_PLAYERS } from '@common/constants/admin-virtual-player';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
export const EMPTY_MESSAGE = { title: '', body: '' };
export const NO_EDITABLE = -1;

@Component({
    selector: 'app-admin-virtual-player-tab',
    templateUrl: './admin-virtual-player-tab.component.html',
    styleUrls: ['./admin-virtual-player-tab.component.scss'],
})
export class AdminVirtualPlayerTabComponent implements OnInit {
    @Input() playerDifficulty: AiDifficulty;
    activeVirtualPlayers: VirtualPlayer[] = JSON.parse(JSON.stringify(DEFAULT_VIRTUAL_PLAYERS));
    errorMessage: Message = EMPTY_MESSAGE;
    isLoading: boolean = false;
    isExpertTab: boolean;
    editable: number = NO_EDITABLE;

    displayedColumns: string[] = ['name', 'edit', 'delete'];

    constructor(
        public adminVpDialog: MatDialogRef<AdminVirtualPlayerTabComponent>,
        private adminVirtualPlayerService: AdminVirtualPlayerService,
        private snackbar: MatSnackBar,
    ) {}

    async ngOnInit(): Promise<void> {
        this.editable = NO_EDITABLE;
        this.errorMessage = EMPTY_MESSAGE;
        this.isLoading = true;
        const display = this.adminVirtualPlayerService.getVirtualPlayers(this.playerDifficulty);
        if (display) this.display = await display.toPromise();
        this.isLoading = false;
    }

    set display(display: VirtualPlayer[] | Message) {
        if (Tools.isTypeOf<Message>(display, 'title')) this.errorMessage = display;
        else if (Tools.isListOfType<VirtualPlayer>(display, 'name')) this.activeVirtualPlayers = display;
    }

    async removeVirtualPlayer(virtualPlayer: VirtualPlayer): Promise<void> {
        if (this.isDefaultVirtualPLayer(virtualPlayer.name)) {
            this.ngOnInit();
            return;
        }

        this.notify(await this.adminVirtualPlayerService.deleteVirtualPlayer(virtualPlayer).toPromise());
        this.ngOnInit();
    }

    async nameModificationEventHandler(valueEmitted: string, player: VirtualPlayer): Promise<void> {
        const newVirtualPlayer = { name: valueEmitted, virtualPlayerDifficulty: this.playerDifficulty };
        this.notify(await this.adminVirtualPlayerService.updateVirtualPlayer(newVirtualPlayer, player).toPromise());
        this.ngOnInit();
    }

    async addPlayerEvent(newVirtualPlayerName: string): Promise<void> {
        const player: VirtualPlayer = { name: newVirtualPlayerName, virtualPlayerDifficulty: this.playerDifficulty };
        this.notify(await this.adminVirtualPlayerService.addVirtualPlayer(player).toPromise());
        await this.ngOnInit();
    }

    isDefaultVirtualPLayer(virtualPlayer: string): boolean {
        for (const player of DEFAULT_VIRTUAL_PLAYERS) {
            if (player.name === virtualPlayer) return true;
        }
        return false;
    }

    close(): void {
        this.adminVpDialog.close();
    }

    get showError(): boolean {
        return !!this.errorMessage.title;
    }

    private notify(message: Message): void {
        this.snackbar.dismiss();
        if (message && message.title) this.snackbar.open(message.title + ' : ' + message.body, 'Ok');
        else this.snackbar.open('Opération effectuée avec succès', 'Ok');
    }
}
