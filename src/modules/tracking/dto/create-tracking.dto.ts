import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ExpenseDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;
}

export class TruckDto {
  @IsString()
  driver_name: string;

  @IsString()
  plate_no: string;

  @IsString()
  truck_name: string;
}

export class CreateTrackingDto {
  @IsString()
  grain_type: string;

  @IsNumber()
  total_sacks: number;

  @IsNumber()
  total_kilos: number;

  @IsNumber()
  price_per_kilo: number;

  @IsNumber()
  total_price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseDto)
  expenses: ExpenseDto[];

  @IsNumber()
  total_expenses: number;

  @IsNumber()
  total_earning: number;

  @ValidateNested()
  @Type(() => TruckDto)
  truck: TruckDto;
}
