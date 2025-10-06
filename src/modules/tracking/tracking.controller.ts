import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { TrackingsService } from './tracking.service';

@Controller('trackings')
export class TrackingsController {
  constructor(private readonly trackingsService: TrackingsService) { }

  @Post()
  create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingsService.create(createTrackingDto);
  }

  @Get()
  findAll(@Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,) {
    return this.trackingsService.findAll(start_date, end_date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrackingDto: UpdateTrackingDto) {
    return this.trackingsService.update(id, updateTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackingsService.remove(id);
  }
}
