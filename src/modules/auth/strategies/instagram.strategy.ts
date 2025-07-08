import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-instagram';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class InstagramStrategy extends PassportStrategy(Strategy, 'instagram') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID =  configService.get<string>('INSTAGRAM_CLIENT_ID');
    const clientSecret =  configService.get<string>('INSTAGRAM_CLIENT_SECRET');
    const callbackURL =  configService.get<string>('INSTAGRAM_CALLBACK_URL') || 'http://localhost:3000/auth/instagram/callback';

    super({
      clientID,
      clientSecret,
      callbackURL
    } as any)
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { id, username, displayName, photos } = profile;

    const user = {
      providerId: id,
      email: `${username}@instagram.local`, // Instagram does not provide email
      firstName: displayName?.split(' ')[0] || username,
      lastName: displayName?.split(' ')[1] || '',
      profilePic: photos?.[0]?.value || '',
      provider: 'INSTAGRAM',
    };

    return this.authService.validateSocialUser(user);
  }
}
