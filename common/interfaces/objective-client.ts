export interface ObjectiveClient {
    description: string;
    points: number;
    isAchieved: boolean;
    owners: ObjectiveOwner[];
}

export interface ObjectiveOwner {
    name: string;
    counter?: number;
}
