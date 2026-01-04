import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryHistoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends PartialType(CreateInventoryHistoryDto) {}
