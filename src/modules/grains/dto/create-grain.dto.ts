import { IsString, IsInt, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExpenseDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;
}

export class CreateGrainDto {
  @IsString()
  grain_type: string;

  @IsInt()
  total_sacks: number;

  @IsInt()
  total_kilos: number;

  @IsNumber()
  price_per_kilo: number;

  @IsNumber()
  total_price: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExpenseDto)
  expenses?: ExpenseDto[];

  @IsNumber()
  total_expenses: number;

  @IsNumber()
  total_income: number;
}
