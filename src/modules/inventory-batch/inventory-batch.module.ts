import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { InventoryBatchService } from './inventory-batch.service';
import { InventoryBatchController } from './inventory-batch.controller';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryBatch, Inventory,InventoryHistory])],
  providers: [InventoryBatchService],
  controllers: [InventoryBatchController],
  exports: [InventoryBatchService],
})
export class InventoryBatchModule {}