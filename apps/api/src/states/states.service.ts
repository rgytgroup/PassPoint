import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Estados activos para el selector de la home (SPEC §4.1). */
  findActive() {
    return this.prisma.state.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
    });
  }

  findByCode(code: string) {
    return this.prisma.state.findUnique({
      where: { code: code.toUpperCase() },
      include: { topics: { orderBy: { order: 'asc' } } },
    });
  }
}
