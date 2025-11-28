import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import type {
  GenerateCodeResponseDto,
  ResolveCodeDto,
  AuthResponseDto,
} from 'apps/commons/types';
import { Observable } from 'rxjs';
import { envs } from '../config/envs';

@Injectable()
export class AuthCodeService {
  constructor(private readonly httpService: HttpService) { }

  generateCode(userId: string): Observable<GenerateCodeResponseDto> {
    return this.httpService
      .post(`${envs.authBaseUrl}/code/generate`, { userId })
      .pipe(map((response) => response.data));
  }

  resolveCode(resolveCodeDto: ResolveCodeDto): Observable<AuthResponseDto> {
    return this.httpService
      .post(`${envs.authBaseUrl}/code/resolve`, resolveCodeDto)
      .pipe(map((response) => response.data));
  }
}
