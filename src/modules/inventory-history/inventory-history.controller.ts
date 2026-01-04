import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryHistoryService } from './inventory-history.service';

@Controller('inventory-history')
export class InventoryHistoryController {
  constructor(
    private readonly inventoryHistoryService: InventoryHistoryService,
  ) {}

  // GET ALL HISTORY
  @Get()
  findAll() {
    return this.inventoryHistoryService.findAll();
  }

  // GET HISTORY BY INVENTORY ID
  @Get('inventory/:inventoryId')
  findByInventory(
    @Param('inventoryId') inventoryId: string,
  ) {
    return this.inventoryHistoryService.findByInventory(inventoryId);
  }

  // GET SINGLE HISTORY RECORD
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryHistoryService.findOne(id);
  }
}
