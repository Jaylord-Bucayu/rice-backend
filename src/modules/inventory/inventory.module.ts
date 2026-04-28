import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

import { InventoryController } from '../inventory/inventory.controller';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';
import { InventoryBatch } from '../inventory-batch/entities/inventory-batch.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryHistory,InventoryBatch])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
