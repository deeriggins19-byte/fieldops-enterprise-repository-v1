import { Body, Controller, HttpException, HttpStatus, Post, Req, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { issueToken } from '../common/auth';
import { requiredString } from '../common/validators';

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

type LoginAttempt = {
  firstAttemptAt: number;
  failures: number;
  lockUntil?: number;
};

const loginAttempts = new Map<string, LoginAttempt>();

function loginKey(email: string, ip: string) {
  return `${email}|${ip}`;
}

function getAttemptState(key: string, now: number): LoginAttempt {
  const existing = loginAttempts.get(key);
  if (!existing || now - existing.firstAttemptAt > LOGIN_WINDOW_MS) {
    const reset: LoginAttempt = { firstAttemptAt: now, failures: 0 };
    loginAttempts.set(key, reset);
    return reset;
  }
  return existing;
}

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('register')
  async register(@Body() body: any) {
    const passwordHash = await bcrypt.hash(requiredString(body, 'password'), 12);
    const tenant = await this.prisma.tenant.create({
      data: {
        name: requiredString(body, 'tenantName'),
        users: {
          create: {
            email: requiredString(body, 'email').toLowerCase(),
            fullName: requiredString(body, 'fullName'),
            passwordHash,
            role: 'OWNER'
          }
        }
      },
      include: { users: true }
    });

    const user = tenant.users[0];
    return { user: { id: user.id, tenantId: user.tenantId, email: user.email, fullName: user.fullName, role: user.role }, token: issueToken(user) };
  }

  @Post('login')
  async login(@Body() body: any, @Req() req: any) {
    const now = Date.now();
    const email = requiredString(body, 'email').toLowerCase();
    const password = requiredString(body, 'password');
    const ip = req?.ip || req?.socket?.remoteAddress || 'unknown';
    const key = loginKey(email, ip);
    const state = getAttemptState(key, now);

    if (state.lockUntil && state.lockUntil > now) {
      throw new HttpException('Too many login attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      state.failures += 1;
      if (state.failures >= LOGIN_MAX_ATTEMPTS) {
        state.lockUntil = now + LOGIN_LOCK_MS;
      }
      loginAttempts.set(key, state);
      throw new UnauthorizedException('Invalid credentials');
    }

    loginAttempts.delete(key);
    return { user: { id: user.id, tenantId: user.tenantId, email: user.email, fullName: user.fullName, role: user.role }, token: issueToken(user) };
  }
}
