// src/expenses/dto/create-expense.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
