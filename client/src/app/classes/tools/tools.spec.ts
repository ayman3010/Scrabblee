import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper/canvas-test-helper';
import { CANVAS_HEIGHT, CANVAS_WIDTH, TILE_COUNT_HORIZONTAL, TILE_COUNT_VERTICAL } from '@app/classes/constants/board-dimensions';
import { Message } from '@app/classes/message';
import { FROM_SYSTEM, SYSTEM_MESSAGE_COLOR } from '@common/constants/room-constants';
import { Orientation } from '@common/enums/enums';
import { HighScoreClient } from '@common/interfaces/high-score';
import { RoomMessage } from '@common/interfaces/room-message';
import {
    BAD_GATEWAY_ERROR_MESSAGE,
    CONFLICT_ERROR_MESSAGE,
    NO_RESPONSE_ERROR_MESSAGE,
    PAYLOAD_TOO_LARGE_ERROR_MESSAGE,
    Tools,
    UNKNOWN_ERROR_MESSAGE,
    UNSUPPORTED_FORMAT_ERROR_MESSAGE,
} from './tools';

describe('Service: Tools', () => {
    const min = 1;
    const max = 3;
    const step = 1;
    const inverted = false;
    let ctxStub: CanvasRenderingContext2D;

    const validTilePosition = { x: 0, y: 0 };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [Tools],
        });
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should return an array containing only 0 with min and max equal to zero', () => {
        const result = Tools.range(0, 0);
        const expected = [0];

        expect(result).toEqual(expected);
    });

    it('should return an empty array with a falsey step', () => {
        const result = Tools.range(min, max, 0);
        const expected: [] = [];

        expect(result).toEqual(expected);
    });

    it('should return an empty array with a negative step', () => {
        const result = Tools.range(min, max, -step);
        const expected: [] = [];

        expect(result).toEqual(expected);
    });

    it('should return an array containing all the steps between min and max, inclusively', () => {
        const result = Tools.range(min, max, step, inverted);
        const expected = [1, 2, 3];

        expect(result).toEqual(expected);
    });

    it('should return an array in decreasing order when provided with valid arguments', () => {
        const result = Tools.range(min, max, step, !inverted);
        const expected = [3, 2, 1];

        expect(result).toEqual(expected);
    });

    it('should return [0, 1] when called with no argument', () => {
        const result = Tools.range();
        const expected = [0, 1];

        expect(result).toEqual(expected);
    });

    it('playerNameSizeCheck should return false when provided with an empty string', () => {
        const result = Tools.playerNameSizeCheck('');
        const expected = false;

        expect(result).toEqual(expected);
    });

    it("playerNameSizeCheck should return false when provided with a name that's too short", () => {
        const result = Tools.playerNameSizeCheck('no');
        const expected = false;

        expect(result).toEqual(expected);
    });

    it("playerNameSizeCheck should return false when provided with a name that's too long", () => {
        const result = Tools.playerNameSizeCheck('John Scrabble, inventor of Scrabble');
        const expected = false;

        expect(result).toEqual(expected);
    });

    it("playerNameSizeCheck should return true when provided with a name that's of a valid length", () => {
        const result = Tools.playerNameSizeCheck('John Scrabble');
        const expected = true;

        expect(result).toEqual(expected);
    });

    it('drawTileBackground should clear pixels on the canvas', () => {
        ctxStub.strokeRect(0, 0, 1, 1);
        let imageData = ctxStub.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        Tools.clearGridContext(ctxStub);
        imageData = ctxStub.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeLessThanOrEqual(beforeSize);
    });

    it('isInBounds should return false if out of bounds from left side', () => {
        const invalidTilePosition = { x: -1, y: 0 };
        const returnValue = Tools.isInBounds(invalidTilePosition);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return false if out of bounds from right side', () => {
        const invalidTilePosition = { x: TILE_COUNT_HORIZONTAL, y: 0 };
        const returnValue = Tools.isInBounds(invalidTilePosition);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return false if out of bounds from upper side', () => {
        const invalidTilePosition = { x: 0, y: -1 };
        const returnValue = Tools.isInBounds(invalidTilePosition);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return false if out of bounds from lower side', () => {
        const invalidTilePosition = { x: 0, y: TILE_COUNT_VERTICAL };
        const returnValue = Tools.isInBounds(invalidTilePosition);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return true if in bounds', () => {
        const returnValue = Tools.isInBounds(validTilePosition);
        expect(returnValue).toBeTruthy();
    });

    it('coordinatesToString should return the right converted string from a given pair of coordinates', () => {
        const expected = 'h8';
        expect(Tools.coordinatesToString({ x: 7, y: 7 })).toEqual(expected);
    });

    it('orientationToString should return h when given an horizontal orientation', () => {
        const expected = 'h';
        expect(Tools.orientationToString(Orientation.Horizontal)).toEqual(expected);
    });

    it('orientationToString should return v when given a vertical orientation', () => {
        const expected = 'v';
        expect(Tools.orientationToString(Orientation.Vertical)).toEqual(expected);
    });

    it('buildRoomMessage should form a RoomMessage with the right parameters, and with an empty color string if no color is specified.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';
        const expectedSenderName = 'John Scrabble';
        const expectedColor = '';

        const result: RoomMessage = Tools.buildRoomMessage(expectedMessage, expectedRoomKey, expectedSenderName);
        expect(result.value).toEqual(expectedMessage);
        expect(result.roomKey).toEqual(expectedRoomKey);
        expect(result.senderName).toEqual(expectedSenderName);
        expect(result.color).toEqual(expectedColor);
    });

    it('buildRoomMessage should form a RoomMessage with the right parameters, and with the correct color attribute if a color is specified.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';
        const expectedSenderName = 'John Scrabble';
        const expectedColor = 'blue';

        const result: RoomMessage = Tools.buildRoomMessage(expectedMessage, expectedRoomKey, expectedSenderName, expectedColor);
        expect(result.value).toEqual(expectedMessage);
        expect(result.roomKey).toEqual(expectedRoomKey);
        expect(result.senderName).toEqual(expectedSenderName);
        expect(result.color).toEqual(expectedColor);
    });

    it('buildSystemRoomMessage should call buildRoomMessage.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildRoomMessageStub = spyOn(Tools, 'buildRoomMessage').and.stub();

        Tools.buildSystemRoomMessage(expectedMessage, expectedRoomKey);

        expect(buildRoomMessageStub).toHaveBeenCalled();
    });

    it('buildSystemRoomMessage should form a RoomMessage with the right parameters.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';
        const expectedSenderName = FROM_SYSTEM;
        const expectedColor = SYSTEM_MESSAGE_COLOR;

        const result: RoomMessage = Tools.buildSystemRoomMessage(expectedMessage, expectedRoomKey);
        expect(result.value).toEqual(expectedMessage);
        expect(result.roomKey).toEqual(expectedRoomKey);
        expect(result.senderName).toEqual(expectedSenderName);
        expect(result.color).toEqual(expectedColor);
    });

    it('isListOfType should return true if the list is of specified type.', () => {
        const message: Message[] = [{ title: 'test', body: 'testing' }];
        expect(Tools.isListOfType<Message>(message, 'body')).toBeTruthy();
    });

    it('isListOfType should return true for an empty list.', () => {
        const list: unknown = [];
        expect(Tools.isListOfType<Message>(list, 'body')).toBeTruthy();
    });

    it('isListOfType should return false for a non list.', () => {
        const message: Message = { title: 'test', body: 'testing' };
        expect(Tools.isListOfType<Message>(message, 'body')).toBeFalsy();
    });

    it('isListOfType should return false if the list is not of specified type.', () => {
        const message: Message[] = [{ title: 'test', body: 'testing' }];
        expect(Tools.isListOfType<HighScoreClient>(message, 'score')).toBeFalsy();
    });

    it('isTypeOf should return true if data is of specified type.', () => {
        const message: Message = { title: 'test', body: 'testing' };
        expect(Tools.isTypeOf<Message>(message, 'title')).toBeTruthy();
    });

    it('isTypeOf should return false if data is not of specified type.', () => {
        const message: Message[] = [{ title: 'test', body: 'testing' }];
        expect(Tools.isTypeOf<HighScoreClient>(message, 'score')).toBeFalsy();
    });

    it('isListOfType should return true for an empty list', () => {
        expect(Tools.isList([])).toBeTruthy();
    });

    it('isListOfType should return true for a string', () => {
        expect(Tools.isList('54')).toBeTruthy();
    });

    it('isListOfType should return false for non list', () => {
        expect(Tools.isList(2)).toBeFalsy();
    });

    it('buildErrorMessage should return the correct message for bad gateway', () => {
        const expectedMessage: Message = { title: 'Erreur', body: BAD_GATEWAY_ERROR_MESSAGE };
        const httpError = jasmine.createSpyObj(HttpErrorResponse, ['status']);
        httpError.status = HttpStatusCode.BadGateway;
        expect(Tools.buildErrorMessage(httpError)).toEqual(expectedMessage);
    });

    it('buildErrorMessage should return the correct message for no response', () => {
        const expectedMessage: Message = { title: 'Erreur', body: NO_RESPONSE_ERROR_MESSAGE };
        const httpError = jasmine.createSpyObj(HttpErrorResponse, ['status']);
        httpError.status = 0;
        expect(Tools.buildErrorMessage(httpError)).toEqual(expectedMessage);
    });

    it('buildErrorMessage should return the correct message for conflict', () => {
        const expectedMessage: Message = { title: 'Erreur', body: CONFLICT_ERROR_MESSAGE };
        const httpError = jasmine.createSpyObj(HttpErrorResponse, ['status']);
        httpError.status = HttpStatusCode.Conflict;
        expect(Tools.buildErrorMessage(httpError)).toEqual(expectedMessage);
    });

    it('buildErrorMessage should return the correct message for conflict', () => {
        const expectedMessage: Message = { title: 'Erreur', body: UNSUPPORTED_FORMAT_ERROR_MESSAGE };
        const httpError = jasmine.createSpyObj(HttpErrorResponse, ['status']);
        httpError.status = HttpStatusCode.UnsupportedMediaType;
        expect(Tools.buildErrorMessage(httpError)).toEqual(expectedMessage);
    });

    it('buildErrorMessage should return the correct message for conflict', () => {
        const expectedMessage: Message = { title: 'Erreur', body: PAYLOAD_TOO_LARGE_ERROR_MESSAGE };
        const httpError = jasmine.createSpyObj(HttpErrorResponse, ['status']);
        httpError.status = HttpStatusCode.PayloadTooLarge;
        expect(Tools.buildErrorMessage(httpError)).toEqual(expectedMessage);
    });

    it('buildErrorMessage should return the correct message for unknown error', () => {
        const expectedMessage: Message = { title: 'Erreur', body: UNKNOWN_ERROR_MESSAGE };
        expect(Tools.buildErrorMessage(new Error('random error'))).toEqual(expectedMessage);
    });

    it('buildErrorMessage should return an empty message for a non error http response', () => {
        const expectedMessage: Message = { title: '', body: '' };
        const httpError = jasmine.createSpyObj(HttpErrorResponse, ['status']);
        httpError.status = HttpStatusCode.NoContent;
        expect(Tools.buildErrorMessage(httpError)).toEqual(expectedMessage);
    });
});
