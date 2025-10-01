import { PartialType } from '@nestjs/mapped-types';
import { CreateGrainDto } from './create-grain.dto';

export class UpdateGrainDto extends PartialType(CreateGrainDto) {}
