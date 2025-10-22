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
    const tracking = this.trackingRepository.create(createTrackingDto);

    // 🧮 Compute total backload amount (sum of cement, abono, hardware totals)
    tracking.total_backload_amount = this.computeBackloadTotal(tracking.backload);

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

  private computeBackloadTotal(backload: any): number {
    if (!backload) return 0;

    const items = [backload.cement, backload.abono, backload.hardware];
    return items.reduce((sum, item) => {
      const total = item?.total ?? 0;
      return sum + Number(total);
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
    tracking.total_income = tracking.total_kilos * tracking.price_per_kilo;
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
