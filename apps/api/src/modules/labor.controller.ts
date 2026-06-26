import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { optionalString } from '../common/validators';

@UseGuards(JwtGuard)
@Controller('labor')
export class LaborController {
  constructor(private prisma: PrismaService) {}

  @Post('start')
  start(@CurrentUser() user: any, @Body() body: any) {
    return this.prisma.laborLog.create({ data: { tenantId: user.tenantId, workerId: user.id, assetId: optionalString(body, 'assetId'), startedAt: new Date(), notes: optionalString(body, 'notes') } });
  }

  @Post(':id/stop')
  async stop(@CurrentUser() user: any, @Param('id') id: string) {
    const log = await this.prisma.laborLog.findFirst({ where: { tenantId: user.tenantId, id } });
    if (!log) throw new Error('Labor log not found');

    const endedAt = new Date();
    const hours = (endedAt.getTime() - log.startedAt.getTime()) / 3600000;
    return this.prisma.laborLog.update({ where: { id }, data: { endedAt, hours } });
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.prisma.laborLog.findMany({ where: { tenantId: user.tenantId }, orderBy: { createdAt: 'desc' } });
  }
}
