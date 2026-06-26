import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { optionalString, requiredString } from '../common/validators';

@UseGuards(JwtGuard)
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.prisma.workOrder.create({
      data: {
        tenantId: user.tenantId,
        projectId: optionalString(body, 'projectId'),
        assetId: optionalString(body, 'assetId'),
        title: requiredString(body, 'title'),
        description: optionalString(body, 'description'),
        priority: optionalString(body, 'priority') || 'NORMAL'
      }
    });
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.prisma.workOrder.findMany({
      where: { tenantId: user.tenantId },
      include: { project: true, asset: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.prisma.workOrder.updateMany({ where: { tenantId: user.tenantId, id }, data: { status: requiredString(body, 'status') as any } });
  }
}
