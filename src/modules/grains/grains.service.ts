import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grain } from './entities/grain.entity';
import { CreateGrainDto } from './dto/create-grain.dto';
import { UpdateGrainDto } from './dto/update-grain.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class GrainsService {
  constructor(
    @InjectRepository(Grain)
    private readonly grainRepository: Repository<Grain>,
  ) {}

  async create(createGrainDto: CreateGrainDto): Promise<Grain> {
    // ✅ Compute total_price
    const total_price = createGrainDto.total_kilos * createGrainDto.price_per_kilo;

    // ✅ Compute total_expense from expenses[]
    const total_expenses = createGrainDto.expenses?.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    ) ?? 0;

    // ✅ Compute total_income (total_price - total_expense)
    const total_income = total_price - total_expenses;

    const grain = this.grainRepository.create({
      ...createGrainDto,
      total_price,
      total_expenses,
      total_income,
    });

    return this.grainRepository.save(grain);
  }

  async findAll(): Promise<Grain[]> {
    return this.grainRepository.find();
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

    // ✅ Always recalc total_price
    if (grain.total_kilos && grain.price_per_kilo) {
      grain.total_price = grain.total_kilos * grain.price_per_kilo;
    }

    // ✅ Always recalc total_expense
    grain.total_expenses = grain.expenses?.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    ) ?? 0;

    // ✅ Always recalc total_income
    grain.total_income = grain.total_price - grain.total_expenses;

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
