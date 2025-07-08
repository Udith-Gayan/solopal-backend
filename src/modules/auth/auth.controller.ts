import { Controller, Post, Body, UseGuards, Request, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { InstagramAuthGuard } from './guards/instagram-auth.guard';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiExcludeEndpoint()
  async facebookAuth() {
    // Initiates Facebook OAuth flow
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiExcludeEndpoint()
  async facebookCallback(@Request() req, @Res() res: Response) {
    const result = await this.authService.socialLogin(req.user);
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.access_token}`);
  }

  @Get('instagram')
  @UseGuards(InstagramAuthGuard)
  @ApiExcludeEndpoint()
  async instagramAuth() {
    // Initiates Instagram OAuth flow
  }

  @Get('instagram/callback')
  @UseGuards(InstagramAuthGuard)
  @ApiExcludeEndpoint()
  async instagramCallback(@Request() req, @Res() res: Response) {
    const result = await this.authService.socialLogin(req.user);
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.access_token}`);
  }
}