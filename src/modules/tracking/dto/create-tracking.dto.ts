import { 
  IsString, 
  IsNumber, 
  IsArray, 
  ValidateNested, 
  IsOptional, 
  IsObject 
} from 'class-validator';
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

export class BackloadItemDto {
  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  total: number;
}

export class BackloadDto {
  @ValidateNested()
  @Type(() => BackloadItemDto)
  cement: BackloadItemDto;

  @ValidateNested()
  @Type(() => BackloadItemDto)
  abono: BackloadItemDto;

  @ValidateNested()
  @Type(() => BackloadItemDto)
  hardware: BackloadItemDto;
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
  total_income: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseDto)
  expenses: ExpenseDto[];

  @IsNumber()
  total_expenses: number;

  @IsNumber()
  total_profit: number;

  @ValidateNested()
  @Type(() => TruckDto)
  truck: TruckDto;

  @ValidateNested()
  @Type(() => BackloadDto)
  backload: BackloadDto;

  @IsNumber()
  total_backload_amount: number;
}
