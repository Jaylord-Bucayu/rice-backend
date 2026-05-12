import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { InventoryBatchService } from './inventory-batch.service';
import { InventoryBatchController } from './inventory-batch.controller';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';
import { AuditModule } from '../audit-logs/audit-logs.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryBatch, Inventory,InventoryHistory]),AuditModule,JwtModule],
  providers: [InventoryBatchService],
  controllers: [InventoryBatchController],
  exports: [InventoryBatchService],
})
export class InventoryBatchModule {}