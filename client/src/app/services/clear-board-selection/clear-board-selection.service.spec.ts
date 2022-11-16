/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { ClearBoardSelectionService } from './clear-board-selection.service';

describe('Service: ClearBoardSelection', () => {
    let service: ClearBoardSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClearBoardSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('notify should call next of clearBoardEvent', () => {
        const spy = spyOn(service.clearBoardEvent, 'next');
        service.notify();
        expect(spy).toHaveBeenCalled();
    });
});
