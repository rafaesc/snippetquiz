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
  constructor(private jwtService: JwtService) { }

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

      // Validate that payload contains required user information
      if (!payload.id) {
        throw new UnauthorizedException('Invalid token payload: missing user ID');
      }

      request['user'] = payload;
      request['token'] = token;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    // Check query parameters first (for SSE connections)
    if (request && request.query && (request.query as any)['token']) {
      return (request.query as any)['token'];
    }

    if (request && request.headers && request.headers['authorization']) {
      return request.headers['authorization']?.split(' ')[1];
    }

    if (request && request.cookies && request.cookies['accessToken']) {
      return request.cookies['accessToken'];
    }
    return undefined;
  }
}
