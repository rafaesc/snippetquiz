export type UserConfigResponse = {
    userId: string;
    characterEnabled: boolean;
    defaultCharacterCode: string;
    createdAt: Date;
    updatedAt: Date;
}

export type UpdateCharacterEnabledRequest = {
    characterEnabled: boolean;
}

export type UserConfigEmotionOrderRequest = {
    emotionOrder: string[];
    userId: string;
    defaultCharacterCode: string;
    characterEnabled: boolean;
    emotionIndex: number;
}