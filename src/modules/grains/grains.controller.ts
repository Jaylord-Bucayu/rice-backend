import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { GrainsService } from './grains.service';
import { CreateGrainDto } from './dto/create-grain.dto';
import { UpdateGrainDto } from './dto/update-grain.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { SignInUser } from '../users/dto/signIn-user.dto';
import { GrainStatus } from './entities/grain.entity';

@Controller('grains')
export class GrainsController {
  constructor(private readonly grainsService: GrainsService) { }

  
  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createGrainDto: CreateGrainDto,@Req() req:SignInUser) {
    
    const user = req.user;
        if(!req.user)  {
           throw new UnauthorizedException('Unauthorized');
        }

    return this.grainsService.create(createGrainDto, user);

  }

  @Get()
  async findAll(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('status') status?: string,
    @Query('cropping') cropping?: number,
    @Query('cropping_year') cropping_year?: number
  ) {
    return this.grainsService.findAll(start_date, end_date, status, cropping,cropping_year);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grainsService.findOne(id);
  }

  @Patch(':id')
    @UseGuards(JwtGuard)
  update(@Param('id') id: string, @Body() updateGrainDto: UpdateGrainDto,@Req() req:SignInUser) {
     const user = req.user;
        if(!req.user)  {
           throw new UnauthorizedException('Unauthorized');
        }

    return this.grainsService.update(id, updateGrainDto,user);
  }

  @Delete(':id')
    @UseGuards(JwtGuard)
  remove(@Param('id') id: string,@Req() req:SignInUser) {
    const user = req.user;
        if(!req.user)  {
           throw new UnauthorizedException('Unauthorized');
        }


    return this.grainsService.remove(id,user);
  }

  // 🆕 POST /grains/bulk
  // Example body: { "ids": ["67147b0b1a3f45e61e1e2a14", "67147b0b1a3f45e61e1e2a22"] }
  @Post('get/bulk')
  async findByIds(@Body('ids') ids: string[]) {
    return this.grainsService.findByIds(ids);
  }

  @Get(':status/summary')
  getSummaryByStatus(
    @Param('status') status: GrainStatus,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    return this.grainsService.getGrainSummaryByStatus(
      status,
      start_date,
      end_date,
    );
  }


}
