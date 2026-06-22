import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { TrackingService } from './tracking.service';

@Controller('trackings')
export class TrackingController {
  constructor(private readonly trackingsService: TrackingService) {}

  @Post()
  create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingsService.create(createTrackingDto);
  }

  @Get()
  findAll(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('cropping') cropping?: number,
   @Query('cropping_year') cropping_year?: number,
  ) {
    return this.trackingsService.findAll(start_date, end_date,cropping,cropping_year);
  }

  // 🔥 NEW: totals endpoint
  @Get('totals')
  getTotals(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('cropping') cropping?: number,
   @Query('cropping_year') cropping_year?: number,
  ) {
    return this.trackingsService.getTotals(start_date, end_date,cropping,cropping_year);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrackingDto: UpdateTrackingDto,
  ) {
    return this.trackingsService.update(id, updateTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackingsService.remove(id);
  }
}
