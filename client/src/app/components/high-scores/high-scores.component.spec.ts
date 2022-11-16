/* tslint:disable:no-unused-variable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighScoresCategoryComponent } from '@app/components/high-scores-category/high-scores-category.component';
import { HighScoresComponent } from './high-scores.component';

describe('HighScoresComponent', () => {
    let component: HighScoresComponent;
    let fixture: ComponentFixture<HighScoresComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatTabsModule, BrowserAnimationsModule, HttpClientModule, MatProgressSpinnerModule],
            declarations: [HighScoresComponent, HighScoresCategoryComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
