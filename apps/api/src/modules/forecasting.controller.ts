import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';

@UseGuards(JwtGuard)
@Controller('forecasting')
export class ForecastingController {
  constructor(private prisma: PrismaService) {}

  @Post('projects/:projectId')
  async forecast(@CurrentUser() user: any, @Param('projectId') projectId: string) {
    const project = await this.prisma.project.findFirst({ where: { tenantId: user.tenantId, id: projectId }, include: { assets: true } });
    if (!project) throw new Error('Project not found');
    const assets = project.assets as Array<{ id: string; status: string }>;

    const totalAssets = Math.max(assets.length, 1);
    const completedAssets = assets.filter((asset: { status: string }) => ['INSTALLED', 'VERIFIED'].includes(asset.status)).length;
    const percentComplete = Math.max(completedAssets / totalAssets, 0.05);

    const logs = (await this.prisma.laborLog.findMany({ where: { tenantId: user.tenantId, assetId: { in: assets.map((asset: { id: string }) => asset.id) } } })) as Array<{ hours: number | string | null }>;
    const actualHours = logs.reduce((sum: number, log: { hours: number | string | null }) => sum + Number(log.hours || 0), 0);
    const projectedTotalHours = actualHours ? actualHours / percentComplete : project.estimatedHours;
    const delayRisk = project.estimatedHours && projectedTotalHours > project.estimatedHours * 1.25 ? 'HIGH' : projectedTotalHours > project.estimatedHours * 1.05 ? 'MEDIUM' : 'LOW';

    return this.prisma.forecast.create({
      data: {
        tenantId: user.tenantId,
        projectId,
        projectedTotalHours,
        confidence: 0.72,
        delayRisk,
        recommendations: ['Review issue assets', 'Compare labor burn', 'Check work orders', 'Ask AI for recovery plan']
      }
    });
  }
}
