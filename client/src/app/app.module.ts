import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AvailableGamesComponent } from '@app/components/available-games/available-games.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { LetterComponent } from '@app/components/letter/letter.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { AddVirtualPlayerFormComponent } from './components/add-virtual-player-form/add-virtual-player-form.component';
import { AdminDictionaryDialogComponent } from './components/admin-dictionary-dialog/admin-dictionary-dialog.component';
import { AdminVirtualPlayerDialogComponent } from './components/admin-virtual-player-dialog/admin-virtual-player-dialog.component';
import { AdminVirtualPlayerTabComponent } from './components/admin-virtual-player-tab/admin-virtual-player-tab.component';
import { ConfirmAbandonDialogComponent } from './components/confirm-abandon-dialog/confirm-abandon-dialog.component';
import { GameOptionsElementsComponent } from './components/game-options-elements/game-options-elements.component';
import { GameOptionsFormComponent } from './components/game-options-form/game-options-form.component';
import { GamesHistoryDialogComponent } from './components/games-history/games-history-dialog.component';
import { HighScoresCategoryComponent } from './components/high-scores-category/high-scores-category.component';
import { HighScoresComponent } from './components/high-scores/high-scores.component';
import { JoinGameDialogComponent } from './components/join-game-dialog/join-game-dialog.component';
import { ObjectiveComponent } from './components/objective/objective.component';
import { TextSizeButtonComponent } from './components/text-size-button/text-size-button.component';
import { VirtualPlayerNameFormComponent } from './components/virtual-player-name-form/virtual-player-name-form.component';
import { WaitForHostComponent } from './components/wait-for-host/wait-for-host.component';
import { WaitingRoomDialogComponent } from './components/waiting-room-dialog/waiting-room-dialog.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { FormatDatePipe } from './pipes/format-date/format-date.pipe';
import { FormatTime } from './pipes/format-time/format-time.pipe';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        AdminVirtualPlayerTabComponent,
        GamePageComponent,
        AddVirtualPlayerFormComponent,
        GameOptionsFormComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        LetterComponent,
        RackComponent,
        SidebarComponent,
        FormatTime,
        AdminDictionaryDialogComponent,
        AdminVirtualPlayerDialogComponent,
        VirtualPlayerNameFormComponent,
        FormatDatePipe,
        JoinGameDialogComponent,
        CommunicationBoxComponent,
        AvailableGamesComponent,
        TextSizeButtonComponent,
        WaitForHostComponent,
        ConfirmAbandonDialogComponent,
        GameOptionsElementsComponent,
        HighScoresComponent,
        HighScoresCategoryComponent,
        GamesHistoryDialogComponent,
        AdminPageComponent,
        ObjectiveComponent,
        WaitingRoomDialogComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {},
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
