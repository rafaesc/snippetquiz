import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiContentController } from './ai-content.controller';
import { AiContentServiceProxyService } from './ai-content-service-proxy.service';


@Module({
    imports: [
        HttpModule,
    ],
    controllers: [
        AiContentController
    ],
    providers: [
        AiContentServiceProxyService,
    ],
    exports: [AiContentServiceProxyService],
})
export class AiContentServiceModule { }
