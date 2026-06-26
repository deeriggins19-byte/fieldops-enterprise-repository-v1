import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const raw = String(request.headers.authorization || '');
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : '';
    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      request.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user);

export function issueToken(user: any) {
  const payload = { id: user.id, tenantId: user.tenantId, email: user.email, fullName: user.fullName, role: user.role };
  const expiresIn = (process.env.JWT_EXPIRES_IN || '12h') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn });
}
