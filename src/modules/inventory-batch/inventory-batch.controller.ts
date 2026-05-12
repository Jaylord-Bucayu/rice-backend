import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';

import { InventoryBatchService } from './inventory-batch.service';
import { SignInUser } from '../users/dto/signIn-user.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';

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
   @UseGuards(JwtGuard)
  async sell(
    @Body()
    body: {
      inventory_id: string;
      quantity: number;
      notes?: string
    },
     @Req() req:SignInUser
  ) {
      const user = req.user;
            if(!req.user)  {
               throw new UnauthorizedException('Unauthorized');
            }

    return this.batchService.sell(body.inventory_id, body.quantity,body.notes,user);
  }

  // ✅ GET TOTAL STOCK (SAFE CHECK)
  @Get(':inventory_id/total')
  async getTotal(
    @Param('inventory_id', ParseIntPipe) inventory_id: number,
  ) {
    return this.batchService.getTotalStock(inventory_id);
  }
}