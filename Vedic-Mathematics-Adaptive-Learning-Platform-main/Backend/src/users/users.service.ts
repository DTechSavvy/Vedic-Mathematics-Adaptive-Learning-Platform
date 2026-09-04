import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findFirst({
      where: { googleId },
    });
  }

  async linkGoogleAccount(userId: number, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        authProvider: 'google',
      },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    googleId?: string | null;
    authProvider?: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
}