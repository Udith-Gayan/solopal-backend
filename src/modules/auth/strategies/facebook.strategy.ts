import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // ✅ Local constants because you can't access `this.configService` before `super()`
    const clientID =  configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret =  configService.get<string>('FACEBOOK_APP_SECRET');
    const callbackURL =  configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3000/auth/facebook/callback';

    super({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'picture'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { id, emails, name, photos } = profile;

    const user = {
      providerId: id,
      email: emails?.[0]?.value || null,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      profilePic: photos?.[0]?.value || '',
      provider: 'FACEBOOK',
    };

    return this.authService.validateSocialUser(user);
  }
}
