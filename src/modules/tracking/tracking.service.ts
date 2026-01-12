import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tracking } from './entities/tracking.entity';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class TrackingsService {
  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
  ) {}

async create(createTrackingDto: CreateTrackingDto): Promise<Tracking> {
  // 1️⃣ Create entity from DTO (raw values only)
  const tracking = this.trackingRepository.create(createTrackingDto);

  // 2️⃣ Normalize backload and keep full structure (quantity, price, total)
  const backload = this.normalizeBackload(createTrackingDto.backload);
  tracking.backload = backload;

  // 3️⃣ Compute BACKLOAD TOTAL
  tracking.total_backload_amount =
    (backload.cement.total ?? 0) +
    (backload.abono.total ?? 0) +
    (backload.hardware.total ?? 0);

  // 4️⃣ Compute total income
  tracking.total_income =
    (createTrackingDto.total_kilos ?? 0) *
    (createTrackingDto.selling_price_per_kilo ?? 0);

  // 5️⃣ Compute total expenses
  tracking.total_expenses =
    createTrackingDto.expenses?.reduce(
      (sum, exp) => sum + Number(exp.amount ?? 0),
      0
    ) ?? 0;

  // 6️⃣ Compute total profit
  tracking.total_profit =
    tracking.total_income +
    tracking.total_backload_amount -
    tracking.total_expenses;

  // 7️⃣ Save
  return this.trackingRepository.save(tracking);
}

private normalizeBackload(backload?: {
  cement?: { quantity?: number; price?: number };
  abono?: { quantity?: number; price?: number };
  hardware?: { quantity?: number; price?: number };
}) {
  const calcItem = (item?: { quantity?: number; price?: number }) => {
    const quantity = Number(item?.quantity ?? 0);
    const price = Number(item?.price ?? 0);
    return {
      quantity,
      price,
      total: quantity * price,
    };
  };

  return {
    cement: calcItem(backload?.cement),
    abono: calcItem(backload?.abono),
    hardware: calcItem(backload?.hardware),
  };
}



  private computeBackloadTotal(backload?: {
  cement?: { quantity?: number; price?: number };
  abono?: { quantity?: number; price?: number };
  hardware?: { quantity?: number; price?: number };
  }): number {
    if (!backload) return 0;

    const items = [backload.cement, backload.abono, backload.hardware];

    return items.reduce((sum, item) => {
      const quantity = Number(item?.quantity ?? 0);
      const price = Number(item?.price ?? 0);
      return sum + quantity * price;
    }, 0);
  }


  async findAll(start_date?: string, end_date?: string): Promise<Tracking[]> {
    let where: any = {};

    if (start_date || end_date) {
      const start = new Date(start_date);
      let end: Date;

      if (end_date) {
        end = new Date(end_date);
      } else {
        end = new Date(start_date);
      }

      end.setUTCHours(23, 59, 59, 999);

      where = {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      };
    }

    return this.trackingRepository.find({ where });
  }

  async findOne(id: string): Promise<Tracking> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    // @ts-ignore - MongoDB query
    const tracking = await this.trackingRepository.findOne({ where: { _id: objectId } });

    if (!tracking) {
      throw new NotFoundException(`Tracking with ID ${id} not found`);
    }

    return tracking;
  }

  async update(id: string, updateTrackingDto: UpdateTrackingDto): Promise<Tracking> {
    const tracking = await this.findOne(id);

    // 🧩 Apply updates
    Object.assign(tracking, updateTrackingDto);

    // 🧮 Recompute totals
    tracking.total_backload_amount = this.computeBackloadTotal(tracking.backload);
    tracking.total_income = tracking.total_kilos * tracking.selling_price_per_kilo;
    tracking.total_expenses = tracking.expenses?.length
      ? tracking.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      : 0;
    tracking.total_profit =
      tracking.total_income + tracking.total_backload_amount - tracking.total_expenses;

    // 💾 Save updates
    return this.trackingRepository.save(tracking);
  }

  async remove(id: string): Promise<void> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const result = await this.trackingRepository.delete(objectId as any);
    if (result.affected === 0) {
      throw new NotFoundException(`Tracking with ID ${id} not found`);
    }
  }
}
