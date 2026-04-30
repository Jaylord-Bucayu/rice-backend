import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // CREATE ITEM
  @Post()
  create(@Body() createDto: CreateInventoryDto) {
    return this.inventoryService.create(createDto);
  }

  // GET ALL ITEMS
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  // GET SINGLE ITEM
  @Get(':id')
  findOne(@Param('id') id: string) {
    //@ts-ignore
    return this.inventoryService.findOne(id);
  }

  // UPDATE ITEM (auto-creates history)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryDto,
  ) {
    //@ts-ignore
    return this.inventoryService.update(id, updateDto);
  }

  // GET ITEM HISTORY
  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    //@ts-ignore
    return this.inventoryService.getHistory(id);
  }

  // DELETE ITEM
  @Delete(':id')
  remove(@Param('id') id: string) {
    //@ts-ignore
    return this.inventoryService.remove(id);
  }

  @Get('get/totals')
  getOverallTotals() {
    return this.inventoryService.getOverallTotals();
  }
}
