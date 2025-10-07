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
  ) { }

  async create(createTrackingDto: CreateTrackingDto): Promise<Tracking> {
    const tracking = this.trackingRepository.create(createTrackingDto);

    // 🧮 Compute total backload amount dynamically
    tracking.total_backload_amount = tracking.backload
      ? Object.values(tracking.backload).reduce((sum, value) => sum + Number(value || 0), 0)
      : 0;

    // 💰 Compute total income
    tracking.total_income = tracking.total_kilos * tracking.price_per_kilo;

    // 💸 Compute total expenses
    tracking.total_expenses = tracking.expenses?.length
      ? tracking.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      : 0;

    // ✅ Compute total profit (income + backload - expenses)
    tracking.total_profit =
      tracking.total_income + tracking.total_backload_amount - tracking.total_expenses;

    // 💾 Save to DB
    return this.trackingRepository.save(tracking);
  }


  async findAll(start_date?: string, end_date?: string): Promise<Tracking[]> {
    let where: any = {};

    if (start_date || end_date) {
      // Convert dates
      const start = new Date(start_date);
      let end: Date;

      if (end_date) {
        end = new Date(end_date);
      } else {
        // if no end_date, use same as start
        end = new Date(start_date);
      }

      // Always cover the full last day (until 23:59:59)
      end.setUTCHours(23, 59, 59, 999);

      // Build query (works with Mongo driver in TypeORM)
      where = {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      };
    }
    return this.trackingRepository.find();
  }

  async findOne(id: string): Promise<Tracking> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    // Query using _id for MongoDB
    // @ts-ignore
    const tracking = await this.trackingRepository.findOne({ where: { _id: objectId } });

    if (!tracking) {
      throw new NotFoundException(`Tracking with ID ${id} not found`);
    }

    return tracking;
  }

  async update(id: string, updateTrackingDto: UpdateTrackingDto): Promise<Tracking> {
    const tracking = await this.findOne(id);

    // Apply updates
    Object.assign(tracking, updateTrackingDto);

    // 🔄 Recompute totals
    tracking.total_income = tracking.total_kilos * tracking.price_per_kilo;

    tracking.total_expenses = tracking.expenses?.length
      ? tracking.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      : 0;

    tracking.total_profit = tracking.total_income - tracking.total_expenses;

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
