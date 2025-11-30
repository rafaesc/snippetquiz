import { Controller, Get, Param, ParseIntPipe, Logger } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterResponse } from './types';

@Controller('characters')
export class CharacterController {
    private readonly logger = new Logger(CharacterController.name);

    constructor(private readonly characterService: CharacterService) { }

    @Get()
    async getAllCharacters(): Promise<CharacterResponse[]> {
        this.logger.log('GET /characters');
        return await this.characterService.getAllCharacters();
    }

    @Get(':code')
    async getCharacterById(@Param('code') code: string): Promise<CharacterResponse> {
        this.logger.log(`GET /characters/${code}`);
        return await this.characterService.getCharacterByCode(code);
    }
}
