import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrainsService } from './grains.service';
import { GrainsController } from './grains.controller';
import { Grain } from './entities/grain.entity';
import { AuditModule } from '../audit-logs/audit-logs.module';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Grain]), AuditModule,JwtModule],
  controllers: [GrainsController],
  providers: [GrainsService],
})
export class GrainsModule {}
