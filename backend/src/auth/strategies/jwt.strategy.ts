import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload, UserFromJwt } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-change-me',
      // Allow a small clock skew between client/server to avoid false early expiry.
      clockTolerance: Number(process.env.JWT_CLOCK_TOLERANCE_SECONDS || 30),
    });
  }

  async validate(payload: JwtPayload): Promise<UserFromJwt> {
    const user = await this.authService.getUserFromPayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
