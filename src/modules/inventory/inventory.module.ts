import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

import { InventoryController } from '../inventory/inventory.controller';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryHistory])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
