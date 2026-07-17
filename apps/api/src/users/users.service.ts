import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crea el usuario si no existe (identificado por email de Supabase). */
  findOrCreate(email: string) {
    return this.prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }
}
