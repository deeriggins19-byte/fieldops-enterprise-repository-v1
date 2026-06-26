import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';

@UseGuards(JwtGuard)
@Controller('ai')
export class AiController {
  constructor(private prisma: PrismaService) {}

  @Post('troubleshoot')
  async troubleshoot(@CurrentUser() user: any, @Body() body: any) {
    const response = {
      summary: `Troubleshooting guidance for ${body.assetCode || 'asset'}`,
      steps: [
        'Confirm asset identity and location.',
        'Capture field notes and photo if available.',
        'Check power/source/labeling/installation state.',
        'Escalate safety or code risks.',
        'Record scan and labor outcome.'
      ],
      requiresHumanReview: false
    };

    await this.prisma.aiInteraction.create({ data: { tenantId: user.tenantId, userId: user.id, type: 'troubleshoot', prompt: JSON.stringify(body), response: JSON.stringify(response) } });
    return response;
  }
}
