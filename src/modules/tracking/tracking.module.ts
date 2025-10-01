import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracking } from './entities/tracking.entity';
import { TrackingsController } from './tracking.controller';
import { TrackingsService } from './tracking.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tracking])],
  controllers: [TrackingsController],
  providers: [TrackingsService],
})
export class TrackingsModule {}
