import { KafkaOptions, Transport } from '@nestjs/microservices';
import { envs } from './envs';

export const getKafkaConfig = (groupId: string): KafkaOptions => ({
    transport: Transport.KAFKA,
    options: {
        client: {
            brokers: [`${envs.kafkaHost}:${envs.kafkaPort}`],
        },
        consumer: {
            groupId,
        },
    },
});
