import { Controller, Get, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/prisma';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`; // quick ping
        return { prisma: { status: 'up' } };
      },
    ]);
  }
}