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
    //const total = createDto.quantity * createDto.price;

    const item = this.inventoryRepo.create({
      ...createDto,
      // total,
    });

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

  // SAVE OLD VALUES
  const oldQuantity = item.quantity;
  const oldPrice = item.price;
  // const oldTotal = item.total;

  // APPLY UPDATES
  const quantity = updateDto.quantity ?? item.quantity;
  const price = updateDto.price ?? item.price;
  const total = quantity * price;

  Object.assign(item, updateDto);
  // item.total = total;

  await this.inventoryRepo.save(item);

  // CREATE HISTORY (NOW MATCHES ENTITY)
  const history = this.historyRepo.create({
    inventoryId: item.id, // number ✅
    old_quantity: oldQuantity,
    new_quantity: quantity,
    old_price: oldPrice,
    new_price: price,
    // old_total: oldTotal,
    // new_total: total,
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

  async remove(id: string): Promise<void> {
  const objectId = new ObjectId(id);

  const item = await this.inventoryRepo.findOne({
    //@ts-ignore
    where: { _id: objectId },
  });

  if (!item) {
    throw new NotFoundException(`Inventory #${id} not found`);
  }

 
  // ✅ SAFE: delete ONLY matching history
  await this.historyRepo.manager
    .getMongoRepository('inventory_history')
    .deleteMany({ inventoryId: objectId });

  // ✅ SAFE: delete inventory
  await this.inventoryRepo.manager
    .getMongoRepository('inventory')
    .deleteOne({ _id: objectId });
    
  console.log(item)
}
}
