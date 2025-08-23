import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';

export function socketAuthMiddleware(jwtService: JwtService) {
  return (socket: Socket, next: (err?: Error) => void) => {
    try {
      const authHeader = socket.handshake.headers?.authorization as string | undefined;
      const cookie = socket.handshake.headers?.cookie as string | undefined;
      const token =
        (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined) ||
        (cookie?.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1]) ||
        (typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : undefined);

      if (!token) return next(new Error('Token not found'));

      const payload = jwtService.verify(token, { secret: process.env.JWT_AUTH_SECRET });
      (socket as any).data = (socket as any).data ?? {};
      (socket as any).data.user = payload;
      (socket as any).data.token = token;
      next();
    } catch (e) {
      next(new Error('Unauthorized'));
    }
  };
}
