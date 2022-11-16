import { Room } from '@app/classes/interfaces/room';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { PLAYER_NAME_LENGTH_MAX, PLAYER_NAME_LENGTH_MIN } from '@common/constants/game-options-constants';
import { FROM_SYSTEM, SYSTEM_MESSAGE_COLOR } from '@common/constants/room-constants';
import { Orientation } from '@common/enums/enums';
import { ObjectiveClient } from '@common/interfaces/objective-client';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import { Position } from '@common/interfaces/vec2';

const LETTER_A_LOWERCASE_VALUE_ASCII = 97;
const NOT_FOUND = -1;

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
     * Function to convert a set of coordinates into a string compatible with the chat commands.
     * Does not check if the input is valid or not, because that is already verified before the function is used.
     *
     * @param toConvert `Position` - Coordinates to convert to a string.
     * @returns `string` - The coordinates converted to a string, will look something like 'h8'.
     */
    static coordinatesToString(toConvert: Position): string {
        return String.fromCharCode(toConvert.coordV + LETTER_A_LOWERCASE_VALUE_ASCII) + (toConvert.coordH + 1).toString();
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
     * Function to verify if data is type of T.
     *
     * @param data `unknown | T` - Data to verify type of.
     * @param predicate `keyof T` - key in type T that would verify typing.
     * @returns `data is T[]` - Whether or not data is a list.
     */
    static isTypeOf<T>(data: unknown | T, predicate: keyof T): data is T {
        return predicate in (data as T);
    }

    /*
     * Function to convert a room to roomClient.
     *
     * @param room `Room` - The room to convert.
     * @returns `RoomClient` - The converted room.
     */
    static convertToRoomClient(room: Room): RoomClient {
        const convertedRoom: RoomClient = {
            key: room.key,
            hostPlayer: room.hostPlayer,
            guestPlayer: room.guestPlayer,
            gameState: room.gameState,
            timer: room.timer,
            board: room.board,
            nbOfTurns: room.nbOfTurns,
            nbSkippedTurns: room.nbSkippedTurns,
            reserve: room.reserve,
            gameOptions: room.gameOptions,
            objectives: this.convertToObjectiveClientList(room.objectives as AbstractObjective[]),
        };
        return convertedRoom;
    }

    /**
     * Function to convert a list of objective to a list of objectiveClient.
     *
     * @param objectives `AbstractObjective[]` - The list of objectives to convert.
     * @returns `ObjectiveClient[]` - The converted list.
     */
    static convertToObjectiveClientList(objectives: AbstractObjective[]): ObjectiveClient[] {
        const convertedObjectives: ObjectiveClient[] = [];
        for (const objective of objectives) convertedObjectives.push(this.convertToObjectiveClient(objective));
        return convertedObjectives;
    }

    /**
     * Function to convert an objective to an objectiveClient.
     *
     * @param objective `AbstractObjective` - The objective to convert.
     * @returns `ObjectiveClient` - The converted objective.
     */
    static convertToObjectiveClient(objective: AbstractObjective): ObjectiveClient {
        const convertedObjective: ObjectiveClient = {
            description: objective.description,
            points: objective.points,
            isAchieved: objective.isAchieved,
            owners: objective.owners,
        };
        return convertedObjective;
    }

    /**
     * Function to generate a random integer from 0 to range.
     *
     * @param range `number` - The maximum value of the random integer.
     * @returns `number` - A random integer.
     */
    static generateRandom(range: number): number {
        return Math.floor(Math.random() * range);
    }

    /**
     * Function to generate a random integer from 0 to range.
     *
     * @param range `number` - The maximum value of the random integer.
     * @param quantity `number` - The number of random integers to generate.
     * @param isUnique `boolean` - Whether to generate unique numbers or not. Defaults to false.
     * @returns `number[]` - A list of random integer.
     */
    static generateMultipleRandom(range: number, quantity: number, isUnique: boolean = false): number[] {
        if (quantity <= 0) return [];

        let quantityAdjustment = 0;
        if (isUnique && range - quantity < 0) quantityAdjustment = range - quantity;
        const randomNumberList: number[] = [];

        while (randomNumberList.length < quantity + quantityAdjustment) {
            const randomNumber = Tools.generateRandom(range);
            if (!isUnique || randomNumberList.indexOf(randomNumber) === NOT_FOUND) randomNumberList.push(randomNumber);
        }

        return randomNumberList;
    }
}
