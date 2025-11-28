import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthCodeService } from './auth-code.service';
import { AuthCodeController } from './auth-code.controller';

@Module({
  imports: [HttpModule],
  controllers: [AuthCodeController],
  providers: [AuthCodeService],
})
export class AuthCodeModule { }
