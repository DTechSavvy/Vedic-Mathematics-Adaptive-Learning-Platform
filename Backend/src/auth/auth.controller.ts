import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const frontendBaseUrl = this.configService.get<string>(
      'CLIENT_URL',
      'http://localhost:8080',
    );
    const redirectUrl = new URL('/auth', frontendBaseUrl);

    try {
      const result = await this.authService.googleLogin(req.user);
      redirectUrl.searchParams.set('token', result.access_token);
      redirectUrl.searchParams.set('google', 'success');
      redirectUrl.searchParams.set('userEmail', result.user.email);
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      redirectUrl.searchParams.set('google', 'error');
      redirectUrl.searchParams.set(
        'message',
        error instanceof Error ? error.message : 'Google login failed',
      );
      return res.redirect(redirectUrl.toString());
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const profile = await this.authService.getProfile(req.user.userId);
    return profile || req.user;
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(
    @Body() body: { email: string; resetCode: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body);
  }
}
