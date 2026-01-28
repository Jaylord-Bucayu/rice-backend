import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsEnum(['Abono', 'Gamot', 'Sako', 'Bini'])
  type: 'Abono' | 'Gamot' | 'Sako' | 'Bini';

  @IsNotEmpty()
  name: string;

  @IsOptional() // optional in DTO
  @IsString()
  img_url?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
