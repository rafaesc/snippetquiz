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

    @Get(':id')
    async getCharacterById(@Param('id', ParseIntPipe) id: number): Promise<CharacterResponse> {
        this.logger.log(`GET /characters/${id}`);
        return await this.characterService.getCharacterById(id);
    }
}
