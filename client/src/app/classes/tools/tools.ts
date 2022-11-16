import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { CANVAS_HEIGHT, CANVAS_WIDTH, TILE_COUNT_HORIZONTAL, TILE_COUNT_VERTICAL } from '@app/classes/constants/board-dimensions';
import { Message } from '@app/classes/message';
import { PLAYER_NAME_LENGTH_MAX, PLAYER_NAME_LENGTH_MIN } from '@common/constants/game-options-constants';
import { FROM_SYSTEM, SYSTEM_MESSAGE_COLOR } from '@common/constants/room-constants';
import { Orientation } from '@common/enums/enums';
import { RoomMessage } from '@common/interfaces/room-message';
import { Vec2 } from '@common/interfaces/vec2';

const LETTER_A_LOWERCASE_VALUE_ASCII = 97;
export const UNKNOWN_ERROR_MESSAGE = 'Raison du problème inconnue';
export const BAD_GATEWAY_ERROR_MESSAGE = 'Connexion impossible à la base de données';
export const NO_RESPONSE_ERROR_MESSAGE = 'Connexion impossible au serveur';
export const CONFLICT_ERROR_MESSAGE = 'Le nom entré existe déjà';
export const PAYLOAD_TOO_LARGE_ERROR_MESSAGE = 'Le fichier entré est trop volumineux';
export const UNSUPPORTED_FORMAT_ERROR_MESSAGE = 'Le format du fichier entré est incorrect';

export class Tools {
    /**
     * Function that behaves like Python's `range()` function.
     *
     * @param min `number` - The lower bound of the range, inclusive. Defaults to `0`.
     * @param max `number` - The higher bound of the range, inclusive. Defaults to `1`.
     * @param step `number` - The step between each values in the range, must be greater than `0`. Defaults to `1`.
     * @param inverted `boolean` - Whether the result will be in increasing or decreasing order, `false` for increasing order. Defaults to `false`.
     *
     * @returns `number[]` An array of number that starts with `min` and that ends before `max`, with increments of `step`.
     * Starts at `max` and ends before `min` if `inverted` is `true`.
     */
    static range(min: number = 0, max: number = 1, step: number = 1, inverted: boolean = false): number[] {
        if (step <= 0) {
            return [];
        }
        const range: number[] = [];
        const minimum = inverted ? max : min;
        const maximum = inverted ? min : max;
        const stepSize = inverted ? -step : step;
        for (let i = minimum; inverted ? i >= maximum : i <= maximum; i += stepSize) {
            range.push(i);
        }
        return range;
    }

    /**
     * Simple function to verify that the lenght of the name of a player is adequate.
     *
     * @param name `string` - Name to verify the length of.
     * @returns `boolean` Whether the name provided is of adequate length or not.
     */
    static playerNameSizeCheck(name: string): boolean {
        if (!name) return false;

        return !(name.length < PLAYER_NAME_LENGTH_MIN || name.length > PLAYER_NAME_LENGTH_MAX);
    }

    /**
     * Function to clear a gridContext.
     *
     * @param gridContext `CanvasRenderingContext2D` - Grid context to clear.
     */
    static clearGridContext(gridContext: CanvasRenderingContext2D) {
        gridContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    /**
     * Function to verify if coordinates are contained in the grid.
     *
     * @param tilePosition `Vec2` - Coordinates to verify.
     * @returns `boolean` Whether the coordinates are in bounds or not.
     */
    static isInBounds(tilePosition: Vec2): boolean {
        return tilePosition.x >= 0 && tilePosition.y >= 0 && tilePosition.x < TILE_COUNT_HORIZONTAL && tilePosition.y < TILE_COUNT_VERTICAL;
    }

    /**
     * Function to convert a set of coordinates into a string compatible with the chat commands.
     * Does not check if the input is valid or not, because that is already verified before the function is used.
     *
     * @param toConvert `Vec2` - Coordinates to convert to a string.
     * @returns `string` - The coordinates converted to a string, will look something like 'h8'.
     */
    static coordinatesToString(toConvert: Vec2): string {
        return String.fromCharCode(toConvert.y + LETTER_A_LOWERCASE_VALUE_ASCII) + (toConvert.x + 1).toString();
    }

    /**
     * Function to convert an orientation into a string compatible with the chat commands.
     *
     * @param toConvert `Orientation` - The orientation to convert to a string.
     * @returns `string` - The orientation converted to a string, will be either 'h' or 'v'.
     */
    static orientationToString(toConvert: Orientation): string {
        return toConvert === Orientation.Horizontal ? 'h' : 'v';
    }

    /**
     * Function to build a RoomMessage from the given parameters.
     *
     * @param message `string` - The message that the result RoomMessage should contain.
     * @param roomKey `string` - The room key that the resulting RoomMessage is destined to.
     * @param senderName `string` - The name of the sender of the resulting RoomMessage.
     * @param color `string` - The color of the message for the chat on the client's side.
     * @returns `RoomMessage` - A RoomMessage that is properly formatted with the given parameters.
     */
    static buildRoomMessage(message: string, roomKey: string, senderName: string, color: string = ''): RoomMessage {
        return {
            value: message,
            roomKey,
            color,
            senderName,
        };
    }

    /**
     * Function to build a RoomMessage that is meant to come from the server.
     *
     * @param message `string` - The message that the result RoomMessage should contain.
     * @param roomKey `string` - The room key that the resulting RoomMessage is destined to.
     * @returns `RoomMessage` - A RoomMessage that is properly formatted to come from the server as the 'Système'.
     */
    static buildSystemRoomMessage(message: string, roomKey: string): RoomMessage {
        return this.buildRoomMessage(message, roomKey, FROM_SYSTEM, SYSTEM_MESSAGE_COLOR);
    }

    /**
     * Function to verify if data is a list of type T.
     *
     * @param data `unknown | T[]` - Data to verify type of.
     * @param predicate `keyof T` - key in type T that would verify typing.
     * @returns `data is T[]` - Whether or not data is a list of type T.
     */
    static isListOfType<T>(data: unknown | T[], predicate: keyof T): data is T[] {
        if (this.isList(data)) return data.length === 0 || this.isTypeOf(data[0], predicate);
        return false;
    }

    /**
     * Function to verify if data is a list.
     *
     * @param data `unknown` - Data to verify type of.
     * @returns `data is unknown[]` - Whether or not data is a list.
     */
    static isList(data: unknown): data is unknown[] {
        return (data as unknown[]).length >= 0;
    }

    /**
     * Function to verify if data is type of T.
     *
     * @param data `unknown | T` - Data to verify type of.
     * @param predicate `keyof T` - key in type T that would verify typing.
     * @returns `data is T[]` - Whether or not data is a list.
     */
    static isTypeOf<T>(data: unknown | T, predicate: keyof T): data is T {
        return predicate in (data as T);
    }

    /**
     * Function to return a message corresponding to the received HTTP status.
     *
     * @param error `Error` - Error to build message from.
     * @returns `Message` - A message corresponding to the error.
     */
    static buildErrorMessage(error: Error): Message {
        if (this.isNotHttpError(error)) return { title: '', body: '' };

        const errorMessage: Message = { title: 'Erreur', body: UNKNOWN_ERROR_MESSAGE };
        if (this.isHttpBadGatewayError(error)) errorMessage.body = BAD_GATEWAY_ERROR_MESSAGE;
        else if (this.isHttpNoResponseError(error)) errorMessage.body = NO_RESPONSE_ERROR_MESSAGE;
        else if (this.isHttpConflictError(error)) errorMessage.body = CONFLICT_ERROR_MESSAGE;
        else if (this.isUnsupportedFormatError(error)) errorMessage.body = UNSUPPORTED_FORMAT_ERROR_MESSAGE;
        else if (this.isPayloadTooLargeError(error)) errorMessage.body = PAYLOAD_TOO_LARGE_ERROR_MESSAGE;
        return errorMessage;
    }

    private static isNotHttpError(error: Error): error is HttpErrorResponse {
        const status = (error as HttpErrorResponse).status;
        return status !== undefined && status < HttpStatusCode.BadRequest && status !== 0;
    }

    private static isHttpBadGatewayError(error: Error): error is HttpErrorResponse {
        return (error as HttpErrorResponse).status === HttpStatusCode.BadGateway;
    }

    private static isHttpNoResponseError(error: Error): error is HttpErrorResponse {
        return (error as HttpErrorResponse).status === 0;
    }

    private static isHttpConflictError(error: Error): error is HttpErrorResponse {
        return (error as HttpErrorResponse).status === HttpStatusCode.Conflict;
    }

    private static isPayloadTooLargeError(error: Error): error is HttpErrorResponse {
        return (error as HttpErrorResponse).status === HttpStatusCode.PayloadTooLarge;
    }

    private static isUnsupportedFormatError(error: Error): error is HttpErrorResponse {
        return (error as HttpErrorResponse).status === HttpStatusCode.UnsupportedMediaType;
    }
}
