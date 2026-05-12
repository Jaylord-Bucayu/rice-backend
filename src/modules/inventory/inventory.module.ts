import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

import { InventoryController } from '../inventory/inventory.controller';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';
import { InventoryBatch } from '../inventory-batch/entities/inventory-batch.entity';
import { AuditModule } from '../audit-logs/audit-logs.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryHistory,InventoryBatch]),AuditModule,JwtModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
