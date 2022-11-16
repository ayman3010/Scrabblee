import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { GameState } from '@common/enums/enums';
import { Player } from '@common/interfaces/player';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollMe') chatBox: ElementRef;
    playerId: string;
    currentRoom: RoomClient;
    messageSent: string;
    roomMessages: RoomMessage[];
    currentPlayer: Player;
    currentMaxScrollHeight: number;

    gameState: typeof GameState;

    constructor(private chatBoxManager: ChatboxManagerService, public dialog: MatDialog, private clearBoardDetector: ClearBoardSelectionService) {
        this.playerId = '';
        this.messageSent = '';
        this.roomMessages = [];
        this.currentMaxScrollHeight = 0;
        this.gameState = GameState;
        this.chatBoxManager.roomEvent.asObservable().subscribe(() => this.updateInfo());
        this.chatBoxManager.messageEvent.asObservable().subscribe(() => this.updateMessages());
    }

    ngAfterViewChecked(): void {
        if (this.chatBox.nativeElement.scrollHeight > this.currentMaxScrollHeight) {
            this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
            this.currentMaxScrollHeight = this.chatBox.nativeElement.scrollHeight;
        }
    }

    ngOnInit(): void {
        this.chatBoxManager.init();
        this.updateInfo();
    }

    updateInfo(): void {
        this.playerId = this.chatBoxManager.playerId;
        this.currentPlayer = this.chatBoxManager.currentPlayer;
        this.currentRoom = this.chatBoxManager.currentRoom;
        this.updateMessages();
    }

    updateMessages(): void {
        this.roomMessages = this.chatBoxManager.roomMessages;
    }

    sendToRoom(): void {
        this.messageSent = this.messageSent.trim();
        if (this.messageSent !== '') {
            this.chatBoxManager.sendToRoom(this.messageSent);
            this.messageSent = '';
        }
    }

    mouseDetect(): void {
        this.clearBoardDetector.notify();
    }
}
