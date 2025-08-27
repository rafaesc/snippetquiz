import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../../../commons/services';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
