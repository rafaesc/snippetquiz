export class CharacterEmotionResponse {
    id: number;
    emotionCode: string;
    name: string;
    shortDescription: string | null;
    spriteUrl: string | null;
    seconds: number | null;
    animationTo: number | null;
    steps: number | null;
    weighted: number | null;
    isDefault: boolean;
}

export class CharacterEmotionsResponse {
    id: number;
    code: string;
    name: string;
    description: string | null;
    introPrompt: string | null;
    emotions?: CharacterEmotionResponse[];
}

export class CharacterResponse {
    id: number;
    code: string;
    name: string;
    description: string | null;
    introPrompt: string | null;
}
