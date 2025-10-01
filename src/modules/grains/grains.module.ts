import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrainsService } from './grains.service';
import { GrainsController } from './grains.controller';
import { Grain } from './entities/grain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grain])],
  controllers: [GrainsController],
  providers: [GrainsService],
})
export class GrainsModule {}
