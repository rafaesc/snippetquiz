import { Module, DynamicModule } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { ClientsModule, KafkaOptions, Transport } from '@nestjs/microservices';
import { KAFKA_SERVICE } from './constants';

@Module({})
export class EventBusModule {
    static register(options: KafkaOptions['options']): DynamicModule {
        return {
            module: EventBusModule,
            imports: [
                ClientsModule.register([
                    {
                        name: KAFKA_SERVICE,
                        transport: Transport.KAFKA,
                        options: options,
                    },
                ]),
            ],
            providers: [EventBusService],
            exports: [EventBusService],
        };
    }
}
