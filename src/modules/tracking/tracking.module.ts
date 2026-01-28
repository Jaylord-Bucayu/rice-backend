import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracking } from './entities/tracking.entity';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { Expense } from '../expense/entities/expense.entity';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tracking, Expense])],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingsModule {}
