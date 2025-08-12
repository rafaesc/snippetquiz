import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { GenerateCodeResponseDto, ResolveCodeDto, AuthResponseDto } from 'apps/commons';
import { AUTH_SERVICE } from '../config/services';
import { Observable } from 'rxjs';


@Injectable()
export class AuthCodeService {
  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientProxy) {}

  generateCode(userId: string): Observable<GenerateCodeResponseDto> {
    return this.client.send<GenerateCodeResponseDto>
    ('auth.generateCode', userId);
  }

  resolveCode(resolveCodeDto: ResolveCodeDto): Observable<AuthResponseDto> {
    return this.client.send<AuthResponseDto>('auth.resolveCode', resolveCodeDto);
  }
}
