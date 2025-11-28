import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthServiceController } from './auth-service.controller';
import { AuthClientService } from './auth-client.service';

@Module({
  imports: [HttpModule],
  controllers: [AuthServiceController],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class AuthServiceModule { }
