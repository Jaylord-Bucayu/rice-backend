import { IsString, IsOptional, IsIn } from "class-validator";

export class TotalsQueryDto {
  @IsString()
  @IsIn(["grain", "tracking"])
  classifier: string;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;

  @IsOptional()
  @IsString()
  grain_type?: string;
}
