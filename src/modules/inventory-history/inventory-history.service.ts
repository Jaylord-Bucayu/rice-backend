import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryHistory } from './entities/inventory-history.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class InventoryHistoryService {
  constructor(
    @InjectRepository(InventoryHistory)
    private readonly historyRepo: Repository<InventoryHistory>,
  ) {}

  // GET ALL HISTORY (OPTIONAL)
  findAll(): Promise<InventoryHistory[]> {
    return this.historyRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  // GET HISTORY BY INVENTORY ID
  async findByInventory(inventoryId: string): Promise<InventoryHistory[]> {
     let objectId: ObjectId;
    
        try {
          objectId = new ObjectId(inventoryId);
        } catch (e) {
          throw new NotFoundException(`Invalid ID format: ${inventoryId}`);
        }

    const history = await this.historyRepo.find({
      //@ts-ignore
      where: { inventoryId:objectId },
      order: { created_at: 'DESC' },
    });

    if (!history.length) {
      throw new NotFoundException(
        `No history found for inventory #${inventoryId}`,
      );
    }

    return history;
  }

  // GET SINGLE HISTORY RECORD
  async findOne(id: string): Promise<InventoryHistory> {
     let objectId: ObjectId;
    
        try {
          objectId = new ObjectId(id);
        } catch (e) {
          throw new NotFoundException(`Invalid ID format: ${id}`);
        }
        
    const record = await this.historyRepo.findOne({
    //@ts-ignore
      where: { _id:objectId },
    });

    if (!record) {
      throw new NotFoundException(`History record #${id} not found`);
    }

    return record;
  }
}
