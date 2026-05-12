import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpensesController } from './expense.controller';
import { ExpensesService } from './expense.service';
import { AuditModule } from '../audit-logs/audit-logs.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Expense]),AuditModule,JwtModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
   exports: [ExpensesService],
})
export class ExpenseModule {}
