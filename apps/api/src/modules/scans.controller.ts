import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { optionalString, requiredString } from '../common/validators';

@UseGuards(JwtGuard)
@Controller('scans')
export class ScansController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const assetId = optionalString(body, 'assetId');
    const assetCode = optionalString(body, 'assetCode');
    const asset = assetId
      ? await this.prisma.asset.findFirst({ where: { tenantId: user.tenantId, id: assetId } })
      : await this.prisma.asset.findFirst({ where: { tenantId: user.tenantId, code: assetCode } });

    if (!asset) throw new Error('Asset not found');

    const type = requiredString(body, 'type') as any;

    const scan = await this.prisma.scanEvent.create({
      data: { tenantId: user.tenantId, projectId: asset.projectId, assetId: asset.id, workerId: user.id, type, notes: optionalString(body, 'notes') }
    });

    const status = type === 'INSTALL_COMPLETE' ? 'INSTALLED' : type === 'ISSUE_FOUND' ? 'ISSUE' : type === 'INSTALL_START' ? 'IN_PROGRESS' : undefined;
    if (status) await this.prisma.asset.update({ where: { id: asset.id }, data: { status: status as any } });

    return scan;
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.prisma.scanEvent.findMany({ where: { tenantId: user.tenantId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}
