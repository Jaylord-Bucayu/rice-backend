import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TotalsController } from './totals.controller';
import { TotalsService } from './totals.service';
import { Grain } from '../grains/entities/grain.entity';
import { Tracking } from '../tracking/entities/tracking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grain,Tracking])], // add Tracking if needed
  controllers: [TotalsController],
  providers: [TotalsService],
})
export class TotalsModule {}
