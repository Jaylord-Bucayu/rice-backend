import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTruckDto {
  @IsString()
  @IsNotEmpty()
  driver_name: string;
    
  @IsString()
  @IsNotEmpty()
  plate_no: string;

  @IsString()
  @IsNotEmpty()
  truck_name: string;
}
