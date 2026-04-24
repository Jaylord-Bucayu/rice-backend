import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';
import { ObjectId } from 'mongodb';


@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

    @InjectRepository(InventoryHistory)
    private historyRepo: Repository<InventoryHistory>,
  ) {}

  // CREATE
  async create(createDto: CreateInventoryDto): Promise<Inventory> {
    const item = this.inventoryRepo.create({ ...createDto });
    return this.inventoryRepo.save(item);
  }

  // READ ALL
  findAll(): Promise<Inventory[]> {
    return this.inventoryRepo.find();
  }

  // READ ONE
  async findOne(id: string): Promise<Inventory> {
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

    return item;
  }

  // UPDATE + HISTORY
  async update(id: string, updateDto: UpdateInventoryDto) {
    //@ts-ignore
    const item = await this.findOne(id);

    // SAVE OLD VALUES ✅ updated to unit_cost & selling_price
    const oldQuantity = item.quantity;
    const oldUnitCost = item.unit_cost;
    const oldSellingPrice = item.selling_price;

    // APPLY UPDATES ✅ updated to unit_cost & selling_price
    const quantity = updateDto.quantity ?? item.quantity;
    const unit_cost = updateDto.unit_cost ?? item.unit_cost;
    const selling_price = updateDto.selling_price ?? item.selling_price;

    Object.assign(item, updateDto);

    await this.inventoryRepo.save(item);

    // CREATE HISTORY ✅ updated to unit_cost & selling_price
    const history = this.historyRepo.create({
      inventoryId: item.id,
      old_quantity: oldQuantity,
      new_quantity: quantity,
      old_unit_cost: oldUnitCost,
      new_unit_cost: unit_cost,
      old_selling_price: oldSellingPrice,
      new_selling_price: selling_price,
      notes: updateDto.notes,
    });

    await this.historyRepo.save(history);

    return item;
  }

  // GET HISTORY
  async getHistory(id: string): Promise<InventoryHistory[]> {
    await this.findOne(id); // ensures inventory exists

    return this.historyRepo.find({
      //@ts-ignore
      where: { inventoryId: id },
      order: { created_at: 'DESC' },
    });
  }

  // DELETE
  async remove(id: string): Promise<void> {
    const objectId = new ObjectId(id);

    const item = await this.inventoryRepo.findOne({
      //@ts-ignore
      where: { _id: objectId },
    });

    if (!item) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }

    await this.historyRepo.manager
      .getMongoRepository('inventory_history')
      .deleteMany({ inventoryId: objectId });

    await this.inventoryRepo.manager
      .getMongoRepository('inventory')
      .deleteOne({ _id: objectId });

    console.log(item);
  }
}