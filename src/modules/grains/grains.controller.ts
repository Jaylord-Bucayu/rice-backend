import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findAll() {
    return this.grainsService.findAll();
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
}
