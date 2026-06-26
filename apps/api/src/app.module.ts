import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './common/prisma.service';
import { HealthController } from './modules/health.controller';
import { AuthController } from './modules/auth.controller';
import { ProjectsController } from './modules/projects.controller';
import { AssetsController } from './modules/assets.controller';
import { WorkOrdersController } from './modules/work-orders.controller';
import { ScansController } from './modules/scans.controller';
import { LaborController } from './modules/labor.controller';
import { InventoryController } from './modules/inventory.controller';
import { ForecastingController } from './modules/forecasting.controller';
import { AiController } from './modules/ai.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    HealthController,
    AuthController,
    ProjectsController,
    AssetsController,
    WorkOrdersController,
    ScansController,
    LaborController,
    InventoryController,
    ForecastingController,
    AiController
  ],
  providers: [PrismaService]
})
export class AppModule {}
