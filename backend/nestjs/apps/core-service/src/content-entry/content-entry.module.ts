import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ContentEntryService } from './content-entry.service';
import { ContentEntryController } from './content-entry.controller';
import { AI_GENERATION_SERVICE } from '../config/services';
import { PrismaModule } from '../../../commons/services';
import { join } from 'path';
import { envs } from '../config/envs';
import { KAFKA_SERVICE } from '../config/services';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: AI_GENERATION_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'ai_generation',
          protoPath: join(__dirname, '../../../../protos/ai_generation.proto'),
          url: `${envs.aiGenerationServiceHost}:${envs.aiGenerationServicePort}`,
        },
      },
      {
        name: KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${envs.kafkaHost}:${envs.kafkaPort}`],
          },
          consumer: {
            groupId: envs.kafkaCoreConsumerGroup,
          },
          send: {
            acks: -1,
          },
          producer: {
            allowAutoTopicCreation: false,
            idempotent: true,
            maxInFlightRequests: 5,
          },
        },
      },
    ]),
  ],
  controllers: [ContentEntryController],
  providers: [ContentEntryService],
  exports: [ContentEntryService], // Add this line to export the service
})
export class ContentEntryModule {}
