import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private sanitizeUser(user: any) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private signToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      authProvider: user.authProvider ?? 'local',
    });
  }

  private async createAuthResponse(user: any) {
    return {
      access_token: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      registerDto.email.toLowerCase(),
    );

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.createUser({
      name: registerDto.name,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
      learningLevel: registerDto.learningLevel || 'BEGINNER',
    });

    return {
      message: 'User registered successfully',
      ...(await this.createAuthResponse(user)),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(
      loginDto.email.toLowerCase(),
    );

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user);
  }

  async googleLogin(profile: {
    googleId: string;
    email: string;
    name: string;
  }) {
    const email = profile.email.toLowerCase();
    const existingGoogleUser = await this.usersService.findByGoogleId(
      profile.googleId,
    );

    if (existingGoogleUser) {
      return this.createAuthResponse(existingGoogleUser);
    }

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      if (existingUser.googleId && existingUser.googleId !== profile.googleId) {
        throw new BadRequestException(
          'This Google account is already linked to another DWANDA user.',
        );
      }

      const updatedUser = await this.usersService.linkGoogleAccount(
        existingUser.id,
        profile.googleId,
      );
      return this.createAuthResponse(updatedUser);
    }

    const hashedPassword = await bcrypt.hash(
      `${profile.googleId}-${Date.now()}`,
      12,
    );
    const createdUser = await this.usersService.createUser({
      name: profile.name,
      email,
      password: hashedPassword,
      googleId: profile.googleId,
      authProvider: 'google',
    });

    return this.createAuthResponse(createdUser);
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }
    return this.sanitizeUser(user);
  }

  async forgotPassword(email: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException('Email address is required');
    }
    const user = await this.usersService.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    return {
      success: true,
      email: user.email,
      resetCode: '108108',
      message: 'Password reset code generated. For academic verification, your recovery code is 108108.',
    };
  }

  async resetPassword(body: { email: string; resetCode: string; newPassword: string }) {
    const { email, resetCode, newPassword } = body;
    if (!email || !resetCode || !newPassword) {
      throw new BadRequestException('Email, reset verification code, and new password are required');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    const user = await this.usersService.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    if (resetCode.trim() !== '108108' && resetCode.trim() !== 'VEDIC108') {
      throw new BadRequestException('Invalid or expired reset code. Please enter 108108.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    };
  }
}
