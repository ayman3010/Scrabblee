/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectiveClient, ObjectiveOwner } from '@common/interfaces/objective-client';
import { ObjectiveComponent } from './objective.component';

describe('ObjectiveComponent', () => {
    let component: ObjectiveComponent;
    let fixture: ComponentFixture<ObjectiveComponent>;
    const firstOwner: ObjectiveOwner = { name: 'John Scrabble' };
    const objective: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [firstOwner] };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ObjectiveComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectiveComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('currentOwner getter should return undefined if objective is undefined', () => {
        expect(component.currentOwner).toBeUndefined();
    });

    it('currentOwner getter should return undefined if objective is currentPlayer is not the owner', () => {
        component.objective = objective;
        component.currentPlayerName = 'Candice Scrabble';
        expect(component.currentOwner).toBeUndefined();
    });

    it('currentOwner getter should return the owner of the correspondent currentPlayer', () => {
        component.objective = objective;
        component.currentPlayerName = 'John Scrabble';
        expect(component.currentOwner).toEqual(firstOwner);
    });

    it('showCounter getter should return false if counter is undefined', () => {
        component.objective = objective;
        component.currentPlayerName = 'John Scrabble';
        expect(component.showCounter).toBeFalsy();
    });

    it('showCounter getter should return false if currentOwner is undefined', () => {
        expect(component.showCounter).toBeFalsy();
    });

    it('showCounter getter should return true if counter is not undefined', () => {
        component.objective = { ...objective, owners: [{ ...firstOwner, counter: 0 }] };
        component.currentPlayerName = 'John Scrabble';
        expect(component.showCounter).toBeTruthy();
    });
});
