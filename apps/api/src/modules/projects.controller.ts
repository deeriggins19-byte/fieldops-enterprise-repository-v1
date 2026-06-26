import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { optionalNumber, optionalString, requiredString } from '../common/validators';

@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.prisma.project.create({
      data: {
        tenantId: user.tenantId,
        name: requiredString(body, 'name'),
        customerName: optionalString(body, 'customerName'),
        estimatedHours: optionalNumber(body, 'estimatedHours', 0)
      }
    });
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.prisma.project.findMany({
      where: { tenantId: user.tenantId },
      include: { assets: true, workOrders: true, forecasts: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get(':id')
  get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.prisma.project.findFirst({
      where: { tenantId: user.tenantId, id },
      include: { assets: true, workOrders: true, forecasts: true, scans: true }
    });
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.prisma.project.updateMany({
      where: { tenantId: user.tenantId, id },
      data: {
        name: optionalString(body, 'name'),
        customerName: optionalString(body, 'customerName'),
        status: body.status
      }
    });
  }
}
