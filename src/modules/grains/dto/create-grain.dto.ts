import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { GrainStatus } from '../entities/grain.entity'

class ExpenseDto {
  @IsString()
  title: string

  @IsNumber()
  amount: number
}

export class CreateGrainDto {
  @IsString()
  grain_type: string

  @IsInt()
  total_sacks: number

  @IsInt()
  total_kilos: number

  @IsNumber()
  price_per_kilo: number

  @IsNumber()
  total_income: number // previously total_price

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExpenseDto)
  expenses?: ExpenseDto[]

  @IsNumber()
  total_expenses: number

  @IsInt()
  cropping: number

  @IsOptional()
  @IsEnum(GrainStatus)
  status?: GrainStatus = GrainStatus.BUY // default to "buy"

  @IsNumber()
  total_gross: number // previously total_income
}
