import { IsString, IsInt, IsNumber } from 'class-validator';

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
}
