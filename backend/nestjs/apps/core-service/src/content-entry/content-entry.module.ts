import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ContentEntryService } from './content-entry.service';
import { ContentEntryController } from './content-entry.controller';
import { AI_GENERATION_SERVICE } from '../config/services';
import { join } from 'path';
import { envs } from '../config/envs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AI_GENERATION_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'ai_generation',
          protoPath: join(
            __dirname,
            '../../../../protos/ai_generation.proto',
          ),
          url: `${envs.aiGenerationServiceHost}:${envs.aiGenerationServicePort}`,
        },
      },
    ]),
  ],
  controllers: [ContentEntryController],
  providers: [ContentEntryService],
})
export class ContentEntryModule {}
