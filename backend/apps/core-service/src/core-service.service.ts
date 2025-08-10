import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
