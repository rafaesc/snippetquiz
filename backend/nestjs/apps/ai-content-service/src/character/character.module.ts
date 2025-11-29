import { Module } from '@nestjs/common';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { PrismaService } from '../utils/prisma.service';

@Module({
    controllers: [CharacterController],
    providers: [CharacterService, PrismaService],
    exports: [CharacterService],
})
export class CharacterModule { }
