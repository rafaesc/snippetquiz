export class UserConfigResponse {
    userId: string;
    characterEnabled: boolean;
    defaultCharacterId: number;
    createdAt: Date;
    updatedAt: Date;
}

export class UpdateCharacterEnabledRequest {
    characterEnabled: boolean;
}
