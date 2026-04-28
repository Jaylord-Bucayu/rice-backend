import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ObjectId } from 'mongodb';
import { InventoryHistory } from '../inventory-history/entities/inventory-history.entity';



@Injectable()
export class InventoryBatchService {
  constructor(
    @InjectRepository(InventoryBatch)
    private readonly batchRepo: Repository<InventoryBatch>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(InventoryHistory)
    private readonly historyRepo: Repository<InventoryHistory>,
  ) {}

  // ✅ ADD STOCK (CREATE BATCH)
  async addStock(data: {
    inventory_id: number;
    quantity: number;
    unit_cost: number;
    selling_price: number;
    expiry_date?: Date;
  }) {

     let objectId: ObjectId;
    
        try {
          objectId = new ObjectId(data.inventory_id);
        } catch (e) {
          throw new NotFoundException(`Invalid ID format: ${data.inventory_id}`);
        }
    

    const inventory = await this.inventoryRepo.findOne({
      //@ts-ignore
      where: { _id: objectId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

     const oldQuantity = inventory.quantity;

    const batch = this.batchRepo.create({
      inventory_id: data.inventory_id,
      quantity: data.quantity,
      remaining_quantity: data.quantity,
      sold_quantity: 0,
      unit_cost: data.unit_cost,
      selling_price: data.selling_price,
      expiry_date: data.expiry_date,
    });

    await this.batchRepo.save(batch);

    // ✅ update inventory totals
    inventory.quantity += data.quantity;
    inventory.display_unit_cost = data.unit_cost;
    inventory.display_selling_price = data.selling_price;

    await this.inventoryRepo.save(inventory);


    // =========================
    // ✅ HISTORY LOG (ADD STOCK)
    // =========================
    await this.historyRepo.save({
      //@ts-ignore
      inventoryId: inventory.id,
      old_quantity: oldQuantity,
      new_quantity: inventory.quantity,
      old_data: null,
      new_data: {
        action: 'ADD_STOCK',
        batch_id: batch.id,
        quantity: data.quantity,
        unit_cost: data.unit_cost,
        selling_price: data.selling_price,
      },
      notes: 'Stock added via batch',
    });

    return batch;
  }

  // ✅ GET ALL BATCHES BY INVENTORY
  async getBatches(inventory_id: string) {
  
    return this.batchRepo.find({
      //@ts-ignore
      where: { inventory_id: inventory_id},
      order: { createdAt: 'ASC' }, // FIFO order
    });
  }

  // ✅ SELL (FIFO)
  async sell(inventory_id: number, sellQty: number) {

    
     let objectId: ObjectId;
      try {
          objectId = new ObjectId(inventory_id);
        } catch (e) {
          throw new NotFoundException(`Invalid ID format: ${inventory_id}`);
        }
    
    const inventory = await this.inventoryRepo.findOne({
      //@ts-ignore
     where: { _id: objectId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (inventory.quantity < sellQty) {
      throw new BadRequestException('Insufficient stock');
    }

     const oldQuantity = inventory.quantity;

    const batches = await this.batchRepo.find({
      where: { inventory_id },
      order: { createdAt: 'ASC' }, // FIFO
    });

    let remainingToSell = sellQty;
    let totalCost = 0;

    for (const batch of batches) {
      if (remainingToSell <= 0) break;

      if (batch.remaining_quantity <= 0) continue;

      const deduct = Math.min(batch.remaining_quantity, remainingToSell);

      batch.remaining_quantity -= deduct;
      batch.sold_quantity += deduct;

      totalCost += deduct * Number(batch.unit_cost);

      remainingToSell -= deduct;

      await this.batchRepo.save(batch);
    }

    // update inventory total
    inventory.quantity -= sellQty;
    await this.inventoryRepo.save(inventory);

    const totalRevenue = sellQty * Number(inventory.display_selling_price || 0);
    const profit = totalRevenue - totalCost;


    // =========================
    // ✅ HISTORY LOG (SELL)
    // =========================
    await this.historyRepo.save({
      //@ts-ignore
      inventoryId: inventory.id,
      old_quantity: oldQuantity,
      new_quantity: inventory.quantity,
      old_data: null,
      new_data: {
        action: 'SELL',
        quantity: sellQty,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        profit: profit,
      },
      notes: 'Stock sold via FIFO',
    });

    return {
      sold: sellQty,
      totalCost,
      totalRevenue,
      profit,
    };
  }

  // ✅ GET TOTAL STOCK (SAFE SOURCE)
  async getTotalStock(inventory_id: number) {
    const batches = await this.batchRepo.find({
      where: { inventory_id },
    });

    return batches.reduce((sum, b) => sum + b.remaining_quantity, 0);
  }
}