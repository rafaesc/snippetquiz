import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_AUTH_SECRET,
      });

      request['user'] = payload;
      request['token'] = token;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    if (request && request.cookies && request.cookies['accessToken']) {
      return request.cookies['accessToken'];
    }

    if (request && request.headers && request.headers['authorization']) {
      return request.headers['authorization']?.split(' ')[1];
    }
    return undefined;
  }
}
