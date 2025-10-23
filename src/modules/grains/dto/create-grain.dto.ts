import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { GrainStatus } from '../entities/grain.entity'

class ExpenseDto {
  @IsString()
  title: string

  @IsNumber()
  @Min(0)
  amount: number
}

export class CreateGrainDto {
  @IsString()
  grain_type: string

  @IsInt()
  @Min(0)
  total_sacks: number

  @IsInt()
  @Min(0)
  total_kilos: number

  @IsNumber()
  @Min(0)
  price_per_kilo: number

  @IsNumber()
  @Min(0)
  total_income: number // previously total_price

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExpenseDto)
  expenses?: ExpenseDto[]

  @IsNumber()
  @Min(0)
  total_expenses: number

  @IsInt()
  cropping: number // 1 or 2

  @IsInt()
  cropping_year: number // e.g. 2025

  @IsOptional()
  @IsEnum(GrainStatus)
  status?: GrainStatus = GrainStatus.BUY // default to "buy"

  @IsNumber()
  @Min(0)
  total_gross: number // previously total_income
}
