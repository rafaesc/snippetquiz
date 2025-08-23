import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';

function parseCookie(cookieStr?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieStr) return out;
  cookieStr.split(';').forEach((c) => {
    const [k, ...v] = c.trim().split('=');
    out[k] = decodeURIComponent(v.join('=') ?? '');
  });
  return out;
}

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    if (!client) throw new UnauthorizedException('No WS client');

    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_AUTH_SECRET,
      });

      if (!payload?.id) {
        throw new UnauthorizedException('Invalid token payload: missing user ID');
      }

      (client as any).data = (client as any).data ?? {};
      (client as any).data.userId = payload.id;
      (client as any).data.token = token;
      this.logger.log(`WebSocket authentication successful for user ID: ${payload.id}`);
      return true;
    } catch (error: any) {
      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      } else if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(client: Socket): string | undefined {
    // 1) Cookie
    const cookies = parseCookie(client.handshake.headers?.cookie as string | undefined);
    if (cookies['accessToken']) return cookies['accessToken'];

    // 2) Authorization: Bearer
    const auth = client.handshake.headers?.authorization as string | undefined;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);

    // 3) Query param ?token=
    const qp = client.handshake.auth?.token || client.handshake.query?.token;
    if (typeof qp === 'string') return qp;

    return undefined;
  }
}
