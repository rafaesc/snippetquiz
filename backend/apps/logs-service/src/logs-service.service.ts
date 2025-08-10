import { Injectable } from '@nestjs/common';

@Injectable()
export class LogsServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
