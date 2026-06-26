import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { optionalString, requiredString } from '../common/validators';

@UseGuards(JwtGuard)
@Controller('assets')
export class AssetsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.prisma.asset.create({
      data: {
        tenantId: user.tenantId,
        projectId: optionalString(body, 'projectId'),
        code: requiredString(body, 'code'),
        name: requiredString(body, 'name'),
        category: optionalString(body, 'category') || 'General'
      }
    });
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.prisma.asset.findMany({ where: { tenantId: user.tenantId }, orderBy: { code: 'asc' } });
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.prisma.asset.updateMany({
      where: { tenantId: user.tenantId, id },
      data: { name: optionalString(body, 'name'), category: optionalString(body, 'category'), status: body.status, projectId: optionalString(body, 'projectId') }
    });
  }
}
