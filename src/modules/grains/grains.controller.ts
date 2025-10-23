import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GrainsService } from './grains.service';
import { CreateGrainDto } from './dto/create-grain.dto';
import { UpdateGrainDto } from './dto/update-grain.dto';

@Controller('grains')
export class GrainsController {
  constructor(private readonly grainsService: GrainsService) {}

  @Post()
  create(@Body() createGrainDto: CreateGrainDto) {
    return this.grainsService.create(createGrainDto);
  }

@Get()
async findAll(
  @Query('start_date') start_date?: string,
  @Query('end_date') end_date?: string,
  @Query('status') status?: string,
  @Query('cropping') cropping?: number
) {
  return this.grainsService.findAll(start_date, end_date, status, cropping);
}


 @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grainsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrainDto: UpdateGrainDto) {
    return this.grainsService.update(id, updateGrainDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grainsService.remove(id);
  }

  // 🆕 POST /grains/bulk
  // Example body: { "ids": ["67147b0b1a3f45e61e1e2a14", "67147b0b1a3f45e61e1e2a22"] }
  @Post('get/bulk')
  async findByIds(@Body('ids') ids: string[]) {
    return this.grainsService.findByIds(ids);
  }

}
