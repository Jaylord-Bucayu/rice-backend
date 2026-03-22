import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TotalsController } from './totals.controller';
import { TotalsService } from './totals.service';
import { Grain } from '../grains/entities/grain.entity';
import { Tracking } from '../tracking/entities/tracking.entity';
import { Expense } from '../expense/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grain,Tracking,Expense])], // add Tracking if needed
  controllers: [TotalsController],
  providers: [TotalsService],
})
export class TotalsModule {}
