import { KafkaOptions, Transport } from '@nestjs/microservices';

export const getKafkaConfig = (envsVars: {
    kafkaHost: string;
    kafkaPort: number;
    [key: string]: any;
}, groupId: string): KafkaOptions => ({
    transport: Transport.KAFKA,
    options: {
        client: {
            brokers: [`${envsVars.kafkaHost}:${envsVars.kafkaPort}`],
        },
        consumer: {
            groupId,
        },
    },
});
