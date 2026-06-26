import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtGuard } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { optionalNumber, optionalString, requiredString } from '../common/validators';

@UseGuards(JwtGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.prisma.inventoryItem.create({
      data: {
        tenantId: user.tenantId,
        sku: requiredString(body, 'sku'),
        name: requiredString(body, 'name'),
        quantity: optionalNumber(body, 'quantity', 0),
        unit: optionalString(body, 'unit') || 'each',
        reorderPoint: optionalNumber(body, 'reorderPoint', 0)
      }
    });
  }

  @Get()
  list(@CurrentUser() user: any) {
    return this.prisma.inventoryItem.findMany({ where: { tenantId: user.tenantId }, orderBy: { sku: 'asc' } });
  }

  @Post(':id/consume')
  async consume(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const item = await this.prisma.inventoryItem.findFirst({ where: { tenantId: user.tenantId, id } });
    if (!item) throw new Error('Inventory item not found');
    return this.prisma.inventoryItem.update({ where: { id }, data: { quantity: item.quantity - optionalNumber(body, 'quantity', 1) } });
  }
}
