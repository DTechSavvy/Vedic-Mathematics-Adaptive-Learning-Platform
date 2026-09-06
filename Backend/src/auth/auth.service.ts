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
    const existingUser = await this.usersService.findByEmail(registerDto.email.toLowerCase());

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.createUser({
      name: registerDto.name,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
    });

    return {
      message: 'User registered successfully',
      ...(await this.createAuthResponse(user)),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email.toLowerCase());

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(loginDto.password, user.password);

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
    const existingGoogleUser = await this.usersService.findByGoogleId(profile.googleId);

    if (existingGoogleUser) {
      return this.createAuthResponse(existingGoogleUser);
    }

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      if (existingUser.googleId && existingUser.googleId !== profile.googleId) {
        throw new BadRequestException('This Google account is already linked to another DWANDA user.');
      }

      const updatedUser = await this.usersService.linkGoogleAccount(existingUser.id, profile.googleId);
      return this.createAuthResponse(updatedUser);
    }

    const hashedPassword = await bcrypt.hash(`${profile.googleId}-${Date.now()}`, 12);
    const createdUser = await this.usersService.createUser({
      name: profile.name,
      email,
      password: hashedPassword,
      googleId: profile.googleId,
      authProvider: 'google',
    });

    return this.createAuthResponse(createdUser);
  }
<<<<<<< Updated upstream
}
=======

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }
    return this.sanitizeUser(user);
  }
}
>>>>>>> Stashed changes
