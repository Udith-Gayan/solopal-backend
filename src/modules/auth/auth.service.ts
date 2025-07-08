import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      approved: false, // Requires admin approval
    } as any);

    const { password, ...result } = user;
    const payload = { email: user.email, sub: user.id } as any;
    
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
      message: 'Registration successful. Please wait for admin approval.',
    };
  }

  async validateSocialUser(socialUser: any) {
    let user = await this.usersService.findByProviderId(socialUser.providerId, socialUser.provider);
    
    if (!user) {
      // Check if user exists with same email
      const existingUser = await this.usersService.findByEmail(socialUser.email);
      if (existingUser) {
        // Link social account to existing user
        user = await this.usersService.linkSocialAccount(existingUser.id, socialUser);
      } else {
        // Create new user
        user = await this.usersService.createSocialUser(socialUser);
      }
    }

    const { password, ...result } = user;
    return result;
  }

  async socialLogin(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}