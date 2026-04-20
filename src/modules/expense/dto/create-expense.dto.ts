// src/expenses/dto/create-expense.dto.ts
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { GrainStatus } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(GrainStatus)
  status?: GrainStatus = GrainStatus.BUY // default to "buy"

}
