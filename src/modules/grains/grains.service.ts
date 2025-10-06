import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Grain } from './entities/grain.entity';
import { CreateGrainDto } from './dto/create-grain.dto';
import { UpdateGrainDto } from './dto/update-grain.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class GrainsService {
  constructor(
    @InjectRepository(Grain)
    private readonly grainRepository: Repository<Grain>,
  ) { }

  async create(createGrainDto: CreateGrainDto): Promise<Grain> {
    // ✅ Compute total_income = kilos × price_per_kilo
    const total_income =
      createGrainDto.total_kilos * createGrainDto.price_per_kilo;

    // ✅ Compute total_expenses from expenses[]
    const total_expenses =
      createGrainDto.expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;

    // ✅ Compute total_profit = income - expenses
    const total_profit = total_income - total_expenses;

    const grain = this.grainRepository.create({
      ...createGrainDto,
      total_income,
      total_expenses,
      total_profit,
    });

    return this.grainRepository.save(grain);
  }

  async findAll(start_date?: string, end_date?: string): Promise<Grain[]> {
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

    return this.grainRepository.find({ where });
  }


  async findOne(id: string): Promise<Grain> {
    let objectId: ObjectId;

    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const grain = await this.grainRepository.findOne({
      //@ts-ignore
      where: { _id: objectId },
    });

    if (!grain) {
      throw new NotFoundException(`Grain with ID ${id} not found`);
    }

    return grain;
  }

  async update(id: string, updateGrainDto: UpdateGrainDto): Promise<Grain> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    // Find existing grain
    const grain = await this.findOne(id);

    // Apply updates
    Object.assign(grain, updateGrainDto);

    // ✅ Always recalc total_income
    if (grain.total_kilos && grain.price_per_kilo) {
      grain.total_income = grain.total_kilos * grain.price_per_kilo;
    }

    // ✅ Always recalc total_expenses
    grain.total_expenses =
      grain.expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;

    // ✅ Always recalc total_profit
    grain.total_profit = grain.total_income - grain.total_expenses;

    return this.grainRepository.save(grain);
  }

  async remove(id: string): Promise<void> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const result = await this.grainRepository.delete(objectId);

    if (result.affected === 0) {
      throw new NotFoundException(`Grain with ID ${id} not found`);
    }
  }
}
