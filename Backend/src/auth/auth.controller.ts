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
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    const frontendBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
  getProfile(@Request() req) {
    return req.user;
  }
}
