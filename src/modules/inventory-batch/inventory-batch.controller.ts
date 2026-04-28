import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { InventoryBatchService } from './inventory-batch.service';

@Controller('inventory-batch')
export class InventoryBatchController {
  constructor(
    private readonly batchService: InventoryBatchService,
  ) {}

  // ✅ ADD STOCK
  @Post('add')
  async addStock(
    @Body()
    body: {
      inventory_id: number;
      quantity: number;
      unit_cost: number;
      selling_price: number;
      expiry_date?: Date;
    },
  ) {
    return this.batchService.addStock(body);
  }

@Get(':inventory_id')
async getBatches(
  @Param('inventory_id') inventory_id: string
) {
  return this.batchService.getBatches(inventory_id);
}
  // ✅ SELL (FIFO)
  @Post('sell')
  async sell(
    @Body()
    body: {
      inventory_id: number;
      quantity: number;
    },
  ) {
    return this.batchService.sell(body.inventory_id, body.quantity);
  }

  // ✅ GET TOTAL STOCK (SAFE CHECK)
  @Get(':inventory_id/total')
  async getTotal(
    @Param('inventory_id', ParseIntPipe) inventory_id: number,
  ) {
    return this.batchService.getTotalStock(inventory_id);
  }
}