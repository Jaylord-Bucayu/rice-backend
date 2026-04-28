import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';
import { ObjectId } from 'mongodb';
import { InventoryBatch } from '../inventory-batch/entities/inventory-batch.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

    @InjectRepository(InventoryHistory)
    private historyRepo: Repository<InventoryHistory>,

    
    @InjectRepository(InventoryBatch)
    private batchRepo: Repository<InventoryBatch>,
  ) { }

  // ✅ CREATE (no stock here)
  async create(createDto: CreateInventoryDto): Promise<Inventory> {
    const item = this.inventoryRepo.create({
      ...createDto,
      quantity: 0, // always start empty
    });

    return this.inventoryRepo.save(item);
  }

  // ✅ READ ALL
  findAll(): Promise<Inventory[]> {
    return this.inventoryRepo.find();
  }

  // ✅ READ ONE
  async findOne(id: number): Promise<Inventory> {
    const item = await this.inventoryRepo.findOne({
      //@ts-ignore
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }

    return item;
  }

  // ✅ UPDATE (SAFE FIELDS ONLY)
  async update(id: number, updateDto: UpdateInventoryDto) {

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const item = await this.inventoryRepo.findOne({
      //@ts-ignore
      where: { _id: objectId },
    });

    if (!item) {
    throw new NotFoundException(`Inventory #${id} not found`);
  }

    // ❌ BLOCK dangerous updates
    if (
      updateDto.quantity !== undefined ||
      updateDto.unit_cost !== undefined ||
      updateDto.selling_price !== undefined
    ) {
      throw new BadRequestException(
        'Use batch endpoints to modify stock or pricing',
      );
    }

    const oldData = {
      name: item.name,
      type: item.type,
      img_url: item.img_url,
    };

    Object.assign(item, updateDto);

    await this.inventoryRepo.save(item);

    // ✅ optional history (safe fields only)
    const history = this.historyRepo.create({
      //@ts-ignore
      inventoryId: item.id,
      notes: updateDto.notes || 'Inventory info updated',
      old_data: JSON.stringify(oldData),
      new_data: JSON.stringify(updateDto),
    });

    await this.historyRepo.save(history);

    return item;
  }

  // ✅ GET HISTORY
  async getHistory(id: number): Promise<InventoryHistory[]> {
    await this.findOne(id);

    return this.historyRepo.find({
      where: { inventoryId: id },
      order: { created_at: 'DESC' },
    });
  }

  // ✅ DELETE
async remove(id: number): Promise<void> {

   let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

  // ✅ 1. check inventory exists
  const item = await this.inventoryRepo.findOne({
    //@ts-ignore
    where: { _id:objectId },
  });

  if (!item) {
    throw new NotFoundException(`Inventory #${id} not found`);
  }

  // =========================
  // ✅ 2. delete history
  // =========================
    //@ts-ignore
  await this.historyRepo.delete({
    inventoryId: objectId,
  });

  // =========================
  // ✅ 3. delete batches (MISSING BEFORE)
  // =========================
  await this.batchRepo.delete({
    inventory_id: id,
  });

  // =========================
  // ✅ 4. delete inventory
  // =========================
  await this.inventoryRepo.delete(id);
}
}